-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create modules table (groups lessons within a course)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_type VARCHAR(20) NOT NULL CHECK (lesson_type IN ('video', 'audio', 'pdf', 'text')),
  content_url TEXT,
  content_text TEXT,
  duration_sec INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_course_progress table (tracks which courses user enrolled in + overall progress)
CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  last_lesson_id UUID REFERENCES lessons(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Create user_lesson_progress table (tracks completion of individual lessons)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position_sec INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (is_published = true OR instructor_id = auth.uid());

CREATE POLICY "Instructors can manage their own courses"
  ON courses FOR ALL
  USING (instructor_id = auth.uid());

-- RLS Policies for modules
CREATE POLICY "Modules are viewable if course is accessible"
  ON modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = modules.course_id
    AND (courses.is_published = true OR courses.instructor_id = auth.uid())
  ));

CREATE POLICY "Instructors can manage modules for their courses"
  ON modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = modules.course_id
    AND courses.instructor_id = auth.uid()
  ));

-- RLS Policies for lessons
CREATE POLICY "Lessons are viewable if module is accessible"
  ON lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modules
    JOIN courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id
    AND (courses.is_published = true OR courses.instructor_id = auth.uid())
  ));

CREATE POLICY "Instructors can manage lessons for their courses"
  ON lessons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modules
    JOIN courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id
    AND courses.instructor_id = auth.uid()
  ));

-- RLS Policies for user_course_progress
CREATE POLICY "Users can view their own course progress"
  ON user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress"
  ON user_course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress"
  ON user_course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_lesson_progress
CREATE POLICY "Users can view their own lesson progress"
  ON user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress"
  ON user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
  ON user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to calculate course progress percentage
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- Count total lessons in course
  SELECT COUNT(l.id) INTO total_lessons
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = p_course_id;

  -- Count completed lessons for user
  SELECT COUNT(ulp.id) INTO completed_lessons
  FROM user_lesson_progress ulp
  JOIN lessons l ON l.id = ulp.lesson_id
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = p_course_id
    AND ulp.user_id = p_user_id
    AND ulp.is_complete = true;

  -- Return percentage (0 if no lessons)
  IF total_lessons = 0 THEN
    RETURN 0;
  ELSE
    RETURN (completed_lessons * 100 / total_lessons);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

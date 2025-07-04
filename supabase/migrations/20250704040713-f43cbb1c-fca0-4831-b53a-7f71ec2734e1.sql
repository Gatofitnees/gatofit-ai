
-- Modificar tabla de programas existente para distinguir tipos
ALTER TABLE public.weekly_programs 
ADD COLUMN program_type TEXT DEFAULT 'simple' CHECK (program_type IN ('simple', 'advanced')),
ADD COLUMN start_date DATE,
ADD COLUMN current_week INTEGER DEFAULT 1,
ADD COLUMN total_weeks INTEGER DEFAULT 1;

-- Crear tabla para semanas de programaciones avanzadas
CREATE TABLE public.advanced_program_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.weekly_programs(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  week_name TEXT,
  week_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para rutinas por semana específica (programaciones avanzadas)
CREATE TABLE public.advanced_program_week_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.weekly_programs(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  routine_id INTEGER REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  order_in_day INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla principal de programas Gatofit
CREATE TABLE public.gatofit_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Principiante', 'Intermedio', 'Avanzado')),
  program_type TEXT NOT NULL DEFAULT 'General',
  target_audience TEXT,
  estimated_sessions_per_week INTEGER DEFAULT 3,
  created_by_admin UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para semanas de programas Gatofit
CREATE TABLE public.gatofit_program_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.gatofit_programs(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  week_name TEXT,
  week_description TEXT,
  focus_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para ejercicios de programas Gatofit
CREATE TABLE public.gatofit_program_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.gatofit_programs(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  exercise_id INTEGER REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER,
  reps_min INTEGER,
  reps_max INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  order_in_day INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para progreso de usuarios en programas Gatofit
CREATE TABLE public.user_gatofit_program_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.gatofit_programs(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_week INTEGER NOT NULL DEFAULT 1,
  current_day INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  completion_percentage NUMERIC DEFAULT 0,
  last_workout_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.advanced_program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_program_week_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatofit_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatofit_program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatofit_program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gatofit_program_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para advanced_program_weeks
CREATE POLICY "Users can view weeks of their own programs" 
  ON public.advanced_program_weeks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert weeks for their own programs" 
  ON public.advanced_program_weeks 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update weeks of their own programs" 
  ON public.advanced_program_weeks 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete weeks of their own programs" 
  ON public.advanced_program_weeks 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

-- Políticas RLS para advanced_program_week_routines
CREATE POLICY "Users can view week routines of their own programs" 
  ON public.advanced_program_week_routines 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert week routines for their own programs" 
  ON public.advanced_program_week_routines 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update week routines of their own programs" 
  ON public.advanced_program_week_routines 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete week routines of their own programs" 
  ON public.advanced_program_week_routines 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

-- Políticas RLS para gatofit_programs
CREATE POLICY "Anyone can view active Gatofit programs" 
  ON public.gatofit_programs 
  FOR SELECT 
  USING (is_active = true);

-- Políticas RLS para gatofit_program_weeks
CREATE POLICY "Anyone can view weeks of active Gatofit programs" 
  ON public.gatofit_program_weeks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.gatofit_programs 
    WHERE id = program_id AND is_active = true
  ));

-- Políticas RLS para gatofit_program_exercises
CREATE POLICY "Anyone can view exercises of active Gatofit programs" 
  ON public.gatofit_program_exercises 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.gatofit_programs 
    WHERE id = program_id AND is_active = true
  ));

-- Políticas RLS para user_gatofit_program_progress
CREATE POLICY "Users can view their own Gatofit program progress" 
  ON public.user_gatofit_program_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Gatofit program progress" 
  ON public.user_gatofit_program_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Gatofit program progress" 
  ON public.user_gatofit_program_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Gatofit program progress" 
  ON public.user_gatofit_program_progress 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_advanced_program_weeks_program_id ON public.advanced_program_weeks(program_id);
CREATE INDEX idx_advanced_program_week_routines_program_week ON public.advanced_program_week_routines(program_id, week_number);
CREATE INDEX idx_gatofit_program_weeks_program_id ON public.gatofit_program_weeks(program_id);
CREATE INDEX idx_gatofit_program_exercises_program_week_day ON public.gatofit_program_exercises(program_id, week_number, day_of_week);
CREATE INDEX idx_user_gatofit_progress_user_active ON public.user_gatofit_program_progress(user_id, is_active);

-- Insertar algunos programas Gatofit de ejemplo
INSERT INTO public.gatofit_programs (name, description, cover_image_url, duration_weeks, difficulty_level, program_type) VALUES
('Fuerza Total', 'Programa completo de fuerza para desarrollar músculo y potencia', 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif', 8, 'Intermedio', 'Fuerza'),
('Cardio Intenso', 'Rutinas de alta intensidad para quemar grasa y mejorar resistencia', 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif', 6, 'Avanzado', 'Cardio'),
('Principiante Plus', 'Programa ideal para comenzar tu journey fitness de manera segura', 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif', 4, 'Principiante', 'General');

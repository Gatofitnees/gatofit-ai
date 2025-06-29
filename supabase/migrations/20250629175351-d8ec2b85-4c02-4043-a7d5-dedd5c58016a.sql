
-- Crear tabla para programaciones semanales
CREATE TABLE public.weekly_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para rutinas asignadas a cada día de la programación
CREATE TABLE public.weekly_program_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.weekly_programs(id) ON DELETE CASCADE,
  routine_id INTEGER NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  order_in_day INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en las tablas
ALTER TABLE public.weekly_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_program_routines ENABLE ROW LEVEL SECURITY;

-- Políticas para weekly_programs
CREATE POLICY "Users can view their own weekly programs" 
  ON public.weekly_programs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly programs" 
  ON public.weekly_programs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly programs" 
  ON public.weekly_programs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly programs" 
  ON public.weekly_programs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para weekly_program_routines
CREATE POLICY "Users can view their own program routines" 
  ON public.weekly_program_routines 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own program routines" 
  ON public.weekly_program_routines 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own program routines" 
  ON public.weekly_program_routines 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own program routines" 
  ON public.weekly_program_routines 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.weekly_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

-- Trigger para actualizar updated_at en weekly_programs
CREATE TRIGGER update_weekly_programs_updated_at
  BEFORE UPDATE ON public.weekly_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar performance
CREATE INDEX idx_weekly_programs_user_id ON public.weekly_programs(user_id);
CREATE INDEX idx_weekly_programs_is_active ON public.weekly_programs(is_active);
CREATE INDEX idx_weekly_program_routines_program_id ON public.weekly_program_routines(program_id);
CREATE INDEX idx_weekly_program_routines_day_of_week ON public.weekly_program_routines(day_of_week);

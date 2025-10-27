import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CoachBranding, DEFAULT_GATOFIT_BRANDING } from '@/types/branding';

export const useCoachBranding = () => {
  const [branding, setBranding] = useState<CoachBranding>(DEFAULT_GATOFIT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachBranding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setBranding(DEFAULT_GATOFIT_BRANDING);
          setLoading(false);
          return;
        }

        // Verificar si el usuario tiene un coach asignado
        const { data: assignment } = await supabase
          .from('coach_user_assignments')
          .select('coach_id')
          .eq('user_id', user.id)
          .single();

        if (!assignment?.coach_id) {
          // Sin coach asignado, usar branding de Gatofit
          setBranding(DEFAULT_GATOFIT_BRANDING);
          setLoading(false);
          return;
        }

        // Obtener branding del coach
        const { data: coachData } = await supabase
          .from('admin_users')
          .select('company_name, banner_image_url, logo_image_url, ranking_image_url, primary_button_color, primary_button_fill_color')
          .eq('id', assignment.coach_id)
          .single();

        if (coachData) {
          // Usar branding del coach con fallbacks a Gatofit
          setBranding({
            companyName: coachData.company_name || DEFAULT_GATOFIT_BRANDING.companyName,
            bannerImageUrl: coachData.banner_image_url || DEFAULT_GATOFIT_BRANDING.bannerImageUrl,
            logoImageUrl: coachData.logo_image_url || DEFAULT_GATOFIT_BRANDING.logoImageUrl,
            rankingImageUrl: coachData.ranking_image_url || DEFAULT_GATOFIT_BRANDING.rankingImageUrl,
            primaryButtonColor: coachData.primary_button_color || DEFAULT_GATOFIT_BRANDING.primaryButtonColor,
            primaryButtonFillColor: coachData.primary_button_fill_color || DEFAULT_GATOFIT_BRANDING.primaryButtonFillColor,
            hasCoach: true
          });
        } else {
          setBranding(DEFAULT_GATOFIT_BRANDING);
        }
      } catch (error) {
        console.error('Error fetching coach branding:', error);
        setBranding(DEFAULT_GATOFIT_BRANDING);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachBranding();
  }, []);

  return { branding, loading };
};

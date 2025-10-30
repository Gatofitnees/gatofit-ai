import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPPORT_EMAIL = Deno.env.get("SUPPORT_EMAIL") || "support@gatofit.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportTicketRequest {
  subject: string;
  message: string;
  category: string;
  attachmentCount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("Unauthorized");
    }

    console.log(`Processing support ticket for user: ${user.email}`);

    // Parse request body
    const { subject, message, category, attachmentCount = 0 }: SupportTicketRequest = await req.json();

    // Validate inputs
    if (!subject || subject.trim().length < 3 || subject.trim().length > 100) {
      throw new Error("Subject must be between 3 and 100 characters");
    }

    if (!message || message.trim().length < 10 || message.trim().length > 5000) {
      throw new Error("Message must be between 10 and 5000 characters");
    }

    const validCategories = ["bug", "suggestion", "question", "other"];
    if (!validCategories.includes(category)) {
      throw new Error("Invalid category");
    }

    // Sanitize message (basic HTML removal)
    const sanitizedMessage = message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || profile?.username || user.email;

    // Insert ticket into database
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: subject.trim(),
        message: sanitizedMessage.trim(),
        category: category,
        status: "open",
        priority: "medium",
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      throw new Error("Failed to create support ticket");
    }

    console.log(`Ticket created with ID: ${ticket.id}`);

    // Prepare email content for admin
    const categoryLabels: Record<string, string> = {
      bug: "🐛 Bug Report",
      suggestion: "💡 Sugerencia",
      question: "❓ Pregunta",
      other: "📝 Otro",
    };

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #667eea; }
            .message-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
            .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            .ticket-id { background: #667eea; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎫 Nuevo Ticket de Soporte</h2>
              <p>Ticket ID: <span class="ticket-id">#${ticket.id.substring(0, 8)}</span></p>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">👤 Usuario:</span> ${userName}
              </div>
              <div class="info-row">
                <span class="label">📧 Email:</span> ${user.email}
              </div>
              <div class="info-row">
                <span class="label">🏷️ Categoría:</span> ${categoryLabels[category]}
              </div>
              <div class="info-row">
                <span class="label">📎 Adjuntos:</span> ${attachmentCount} archivo(s)
              </div>
              <div class="info-row">
                <span class="label">📅 Fecha:</span> ${new Date().toLocaleString("es-ES")}
              </div>
              
              <h3 style="color: #667eea; margin-top: 20px;">📋 Asunto:</h3>
              <p style="font-size: 16px; font-weight: bold;">${subject}</p>
              
              <h3 style="color: #667eea;">💬 Mensaje:</h3>
              <div class="message-box">
                ${sanitizedMessage.replace(/\n/g, "<br>")}
              </div>
              
              ${attachmentCount > 0 ? `
                <p style="margin-top: 20px; font-style: italic; color: #666;">
                  ℹ️ Este ticket incluye ${attachmentCount} archivo(s) adjunto(s). Los archivos están disponibles en el panel de administración.
                </p>
              ` : ""}
            </div>
            <div class="footer">
              <p>Sistema de Soporte GatofitAI</p>
              <p>Ticket ID: ${ticket.id}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to admin
    const { error: adminEmailError } = await resend.emails.send({
      from: "GatofitAI Soporte <noreply@soporte.gatofit.com>",
      to: [SUPPORT_EMAIL],
      subject: `[Ticket #${ticket.id.substring(0, 8)}] ${subject}`,
      html: adminEmailHtml,
    });

    if (adminEmailError) {
      console.error("Error sending admin email:", adminEmailError);
      // Don't throw - ticket is created, email is secondary
    } else {
      console.log("Admin notification email sent successfully");
    }

    // Send confirmation email to user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .ticket-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h2>Ticket Recibido</h2>
              <p style="margin: 0;">Hemos recibido tu solicitud de soporte</p>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              
              <p>Tu ticket de soporte ha sido creado exitosamente. Nuestro equipo lo revisará y te responderá a la brevedad.</p>
              
              <div class="ticket-box">
                <p><strong>🎫 Número de Ticket:</strong> #${ticket.id.substring(0, 8)}</p>
                <p><strong>📋 Asunto:</strong> ${subject}</p>
                <p><strong>🏷️ Categoría:</strong> ${categoryLabels[category]}</p>
                <p><strong>📅 Fecha de Creación:</strong> ${new Date().toLocaleString("es-ES")}</p>
              </div>
              
              <p><strong>⏱️ Tiempo estimado de respuesta:</strong> 24-48 horas</p>
              
              <p>Recibirás una notificación por email cuando nuestro equipo responda a tu ticket.</p>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                Si tienes alguna pregunta adicional, no dudes en crear un nuevo ticket desde la aplicación.
              </p>
            </div>
            <div class="footer">
              <p>Gracias por usar GatofitAI</p>
              <p>Sistema de Soporte</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: userEmailError } = await resend.emails.send({
      from: "GatofitAI Soporte <noreply@soporte.gatofit.com>",
      to: [user.email!],
      subject: `Tu ticket de soporte ha sido recibido (#${ticket.id.substring(0, 8)})`,
      html: userEmailHtml,
    });

    if (userEmailError) {
      console.error("Error sending user confirmation email:", userEmailError);
      // Don't throw - ticket is created, email is secondary
    } else {
      console.log("User confirmation email sent successfully");
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticketId: ticket.id,
        message: "Ticket creado exitosamente",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Error al procesar el ticket",
      }),
      {
        status: error.message === "Unauthorized" ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    } as any);
  }

  async enviarCredenciales(
    email: string,
    nombre: string,
    telefono: string,
    contrasena: string,
    rol: string,
    fincaNombre: string,
  ) {
    const mailOptions = {
      from: `Sistema Bovino <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Credenciales de acceso - Sistema Bovino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10b981; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Sistema Bovino</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827;">¡Bienvenido, ${nombre}!</h2>
            <p style="color: #4b5563;">Se ha creado una cuenta para ti en la finca <strong>${fincaNombre}</strong>.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #111827; margin-top: 0;">Tus credenciales de acceso:</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Teléfono:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${telefono}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Contraseña:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #10b981;">${contrasena}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Rol:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${rol}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
              © ${new Date().getFullYear()} Sistema Bovino. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);

    } catch (error) {
      console.error(`Error al enviar el correo a ${email}:`, error);
      throw new Error('El usuario se creó, pero hubo un error al enviar el correo.');
    }
  }

  async notificarCambioEmail(
    emailNuevo: string,
    nombre: string,
    fincaNombre: string
  ) {
    const mailOptions = {
      from: `Sistema Bovino <${process.env.SMTP_USER}>`,
      to: emailNuevo,
      subject: 'Tu correo ha sido actualizado - Sistema Bovino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Sistema Bovino</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827;">¡Hola, ${nombre}!</h2>
            <p style="color: #4b5563;">Te confirmamos que tu correo electrónico ha sido actualizado exitosamente.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #111827; margin-top: 0;">📧 Detalles del cambio:</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Correo nuevo:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #3b82f6;">${emailNuevo}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Finca:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${fincaNombre}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #4b5563;">Fecha:</td>
                  <td style="padding: 10px; font-weight: bold;">${new Date().toLocaleString('es-ES')}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
              © ${new Date().getFullYear()} Sistema Bovino. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error al enviar el correo de notificación a ${emailNuevo}:`, error);
    }
  }

  async notificarCambioContrasena(
    email: string,
    nombre: string,
    fincaNombre: string,
  ) {
    const mailOptions = {
      from: `Sistema Bovino <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Tu contraseña ha sido actualizada - Sistema Bovino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ef4444; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Sistema Bovino</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827;">¡Hola, ${nombre}!</h2>
            <p style="color: #4b5563;">Te informamos que la contraseña de tu cuenta para la finca <strong>${fincaNombre}</strong> ha sido actualizada exitosamente.</p>
            
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0; font-weight: bold;">¿No fuiste tú?</p>
              <p style="color: #7f1d1d; margin: 5px 0 0 0; font-size: 14px;">
                Si tú no realizaste este cambio, por favor ponte en contacto de inmediato con el administrador de tu finca.
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
              © ${new Date().getFullYear()} Sistema Bovino. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error al enviar el correo de cambio de contraseña a ${email}:`, error);
    }
  }
}
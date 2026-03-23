import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
      user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      family: 4, 
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000,
    }as any);
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
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;"> Contraseña:</td>
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
      console.error('Error al enviar el correo a ${email}:', error);
      throw new Error('El usuario se creó, pero hubo un error al enviar el correo.');
    }
  }
}
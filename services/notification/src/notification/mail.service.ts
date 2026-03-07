import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;

  async onModuleInit(): Promise<void> {
    const host = process.env.MAILTRAP_HOST || 'smtp.mailtrap.io';
    const port = parseInt(process.env.MAILTRAP_PORT || '2525', 10);
    const user = process.env.MAILTRAP_USER;
    const pass = process.env.MAILTRAP_PASS;
    const from = process.env.MAIL_FROM || 'noreply@uit-dkhp.local';
    if (!user || !pass) {
      console.warn('Mailtrap credentials not set; emails will not be sent');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendEnrolledEmail(
    to: string,
    fullName: string,
    classDetails: { classCode: string; courseName: string }[],
  ): Promise<void> {
    if (!this.transporter) return;
    const list = classDetails.map((c) => `- ${c.classCode}: ${c.courseName}`).join('\n');
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@uit-dkhp.local',
      to,
      subject: '[UIT-ĐKHP] Xác nhận đăng ký học phần',
      text: `Xin chào ${fullName},\n\nBạn đã đăng ký thành công các lớp sau:\n\n${list}\n\nTrân trọng,\nHệ thống Đăng ký học phần UIT.`,
      html: `<p>Xin chào <strong>${fullName}</strong>,</p><p>Bạn đã đăng ký thành công các lớp sau:</p><ul>${classDetails.map((c) => `<li>${c.classCode}: ${c.courseName}</li>`).join('')}</ul><p>Trân trọng,<br>Hệ thống Đăng ký học phần UIT.</p>`,
    });
  }

  async sendCancelledEmail(
    to: string,
    fullName: string,
    classCode: string,
    courseName: string,
  ): Promise<void> {
    if (!this.transporter) return;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@uit-dkhp.local',
      to,
      subject: '[UIT-ĐKHP] Xác nhận hủy đăng ký học phần',
      text: `Xin chào ${fullName},\n\nBạn đã hủy đăng ký lớp ${classCode} - ${courseName}.\n\nTrân trọng,\nHệ thống Đăng ký học phần UIT.`,
      html: `<p>Xin chào <strong>${fullName}</strong>,</p><p>Bạn đã hủy đăng ký lớp <strong>${classCode}</strong> - ${courseName}.</p><p>Trân trọng,<br>Hệ thống Đăng ký học phần UIT.</p>`,
    });
  }
}

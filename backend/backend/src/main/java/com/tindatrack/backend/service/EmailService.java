package com.tindatrack.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(String toEmail, String userName, String storeName, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to TindaTrack! 🏪");
            helper.setText(buildWelcomeHtml(userName, storeName, role), true);

            mailSender.send(message);
            System.out.println("[EmailService] Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send welcome email: " + e.getMessage());
        }
    }

    @Async
    public void sendSaleConfirmationEmail(String toEmail, String userName,
                                          String itemName, int quantity,
                                          double price, double total,
                                          String storeName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Sale Recorded – " + itemName);
            helper.setText(buildSaleConfirmationHtml(
                    userName, itemName, quantity, price, total, storeName), true);

            mailSender.send(message);
            System.out.println("[EmailService] Sale confirmation sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send sale confirmation: " + e.getMessage());
        }
    }

    private String buildWelcomeHtml(String userName, String storeName, String role) {
        String roleLabel = "OWNER".equalsIgnoreCase(role) ? "Store Owner" : "Staff Member";
        String storeSection = storeName != null
                ? "<p style='margin:0 0 8px 0;color:#555;font-size:15px;'>Store: <strong>" + storeName + "</strong></p>"
                : "";
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#F4F1DE;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:40px 20px;">
                    <table width="540" cellpadding="0" cellspacing="0"
                           style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                      <tr>
                        <td style="background:#E07A5F;padding:36px 40px;text-align:center;">
                          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                            🏪 TindaTrack
                          </h1>
                          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                            Manage Your Sari-Sari Store
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <h2 style="margin:0 0 16px;color:#2D2D2D;font-size:22px;">
                            Welcome, %s! 👋
                          </h2>
                          <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                            Your TindaTrack account has been created successfully.
                            You're registered as a <strong>%s</strong>.
                          </p>

                          <div style="background:#FAF8F3;border:1px solid #EDE8DC;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                            <p style="margin:0 0 8px 0;color:#555;font-size:15px;">Name: <strong>%s</strong></p>
                            %s
                            <p style="margin:0;color:#555;font-size:15px;">Role: <strong>%s</strong></p>
                          </div>

                          <a href="%s/login"
                             style="display:inline-block;background:#E07A5F;color:#fff;text-decoration:none;
                                    padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                            Go to Dashboard →
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td style="background:#FAF8F3;padding:20px 40px;border-top:1px solid #EDE8DC;">
                          <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
                            © 2026 TindaTrack · This email was sent to you because you registered an account.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(userName, roleLabel, userName, storeSection, roleLabel, frontendUrl);
    }

    private String buildSaleConfirmationHtml(String userName, String itemName,
                                              int quantity, double price,
                                              double total, String storeName) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#F4F1DE;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:40px 20px;">
                    <table width="540" cellpadding="0" cellspacing="0"
                           style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                      <tr>
                        <td style="background:#E07A5F;padding:36px 40px;text-align:center;">
                          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">
                            🏪 TindaTrack
                          </h1>
                          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                            Sale Confirmation
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <h2 style="margin:0 0 8px;color:#2D2D2D;font-size:22px;">
                            Sale Recorded ✅
                          </h2>
                          <p style="margin:0 0 28px;color:#555;font-size:15px;">
                            Hi <strong>%s</strong>, a new sale has been recorded at <strong>%s</strong>.
                          </p>

                          <div style="background:#FAF8F3;border:1px solid #EDE8DC;border-radius:12px;
                                      overflow:hidden;margin-bottom:28px;">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr style="border-bottom:1px solid #EDE8DC;">
                                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;
                                           text-transform:uppercase;letter-spacing:0.5px;width:40%%;">Item</td>
                                <td style="padding:14px 20px;color:#2D2D2D;font-size:15px;font-weight:600;">%s</td>
                              </tr>
                              <tr style="border-bottom:1px solid #EDE8DC;">
                                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;
                                           text-transform:uppercase;letter-spacing:0.5px;">Quantity</td>
                                <td style="padding:14px 20px;color:#2D2D2D;font-size:15px;">%d</td>
                              </tr>
                              <tr style="border-bottom:1px solid #EDE8DC;">
                                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;
                                           text-transform:uppercase;letter-spacing:0.5px;">Price / unit</td>
                                <td style="padding:14px 20px;color:#2D2D2D;font-size:15px;">₱%.2f</td>
                              </tr>
                              <tr>
                                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;
                                           text-transform:uppercase;letter-spacing:0.5px;">Total</td>
                                <td style="padding:14px 20px;color:#E07A5F;font-size:18px;font-weight:800;">
                                  ₱%.2f
                                </td>
                              </tr>
                            </table>
                          </div>

                          <a href="%s/sales"
                             style="display:inline-block;background:#E07A5F;color:#fff;text-decoration:none;
                                    padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                            View Sales Records →
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td style="background:#FAF8F3;padding:20px 40px;border-top:1px solid #EDE8DC;">
                          <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
                            © 2026 TindaTrack · Automated sale confirmation
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(userName, storeName, itemName, quantity, price, total, frontendUrl);
    }
}

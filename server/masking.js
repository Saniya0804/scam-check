export function maskSensitive(text) {
  return text
    // OTP: "OTP is 482913" -> "OTP is [OTP]"
    .replace(/\b(otp|code|pin)\b([^\d]{0,15})(\d{4,8})\b/gi, "$1$2[OTP]")
    // Indian phone numbers
    .replace(/(\+91[\s-]?)?\b[6-9]\d{9}\b/g, "[PHONE]")
    // Long digit strings (account/card numbers)
    .replace(/\b\d{9,18}\b/g, "[NUMBER]");
}
import { maskSensitive } from "./masking.js";
import { runRules } from "./rules.js";

const samples = [
  ["SCAM", "Dear customer, your SBI account will be blocked today. Update KYC now: http://sbi-kyc-update.xyz/login"],
  ["SCAM", "This is CBI. A parcel in your name has drugs. Install AnyDesk immediately or you will face digital arrest."],
  ["SCAM", "Congratulations you have won Rs 25 lakh lottery! Share your OTP 482913 to claim: bit.ly/win-now"],
  ["SAFE", "Rs 500.00 debited from A/c XX1234 on 18-11-26 at SWIGGY. Not you? Call your bank helpline."],
  ["SAFE", "Your Amazon order has shipped. Track at https://www.amazon.in/orders"],
  ["SAFE", "Hey, are we meeting at 5 today?"],
];
for (const [expected, msg] of samples) {
  const r = runRules(maskSensitive(msg));
  console.log(`[expected ${expected}] -> ${r.level} (${r.score})`);
  r.findings.forEach((f) => console.log("   -", f.id));
}

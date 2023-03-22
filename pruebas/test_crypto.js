const crypto = require('crypto')

const resetToken = crypto.randomBytes(20).toString("hex")

const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

console.log(resetToken)
console.log(resetPasswordToken)

console.log('qty:', '080733ac24115a82b974eda09254cf65c0fd6f8eb034bfd4a22929ea646035c1'.length)
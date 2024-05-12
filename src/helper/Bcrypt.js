const bcrypt = require("bcryptjs");

export const HashPassword = async (password) => {
  try {
    // const salt = "$2b$10$eySay7IoMUc2.vcncW4VIO";

    // Generate a random salt synchronously
    const salt = bcrypt.genSaltSync(10);

    console.log("Generated Salt:", salt);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    return null;
  }
};

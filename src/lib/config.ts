import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'admin-config.json');

export type AdminConfig = {
  passwordHash: string;
};

// Default password is 'postcard101'
// Note: In a real production app, this should be a bcrypt hash. 
// For this simple personal CMS, we use a basic SHA-256 or just plain text if she wants to easily recover it.
// The user requested: "không lưu sẵn password ở đâu cả. Tạm thời hãy để password đơn giản là postcard101 đã."
// We will store it in admin-config.json which can be ignored by git if needed.
const DEFAULT_PASSWORD = 'postcard101';

export function getAdminPassword(): string {
  if (!fs.existsSync(configPath)) {
    // If config doesn't exist, create it with the default password
    setAdminPassword(DEFAULT_PASSWORD);
    return DEFAULT_PASSWORD;
  }
  
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    const config: AdminConfig = JSON.parse(data);
    return config.passwordHash || DEFAULT_PASSWORD;
  } catch (e) {
    return DEFAULT_PASSWORD;
  }
}

export function setAdminPassword(newPassword: string): void {
  const config: AdminConfig = { passwordHash: newPassword };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

import java.security.spec.KeySpec;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class PasswordUtil {
    private static final int ITERATIONS = 1000;
    private static final int KEY_SIZE = 256;

    // Hash the password using PBKDF2
    public static String hashPassword(String password, byte[] salt) {
        System.out.println("PasswordUtil: Hashing password...");
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_SIZE);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            System.out.println("PasswordUtil: Password hashed successfully");
            return bytesToHex(hash);
        } catch (Exception e) {
            System.out.println("PasswordUtil: Error hashing password: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // Verify password
    public static boolean verifyPassword(String inputPassword, String storedHash, byte[] salt) {
        String hashedInput = hashPassword(inputPassword, salt);
        return hashedInput.equals(storedHash);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}

import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.security.spec.KeySpec;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class PasswordUtil {
    private static final int ITERATIONS = 1000;
    private static final int KEY_SIZE = 256;

    // Hash the password using PBKDF2
    public static String hashPassword(String plainPassword, byte[] salt) {
        try {
            KeySpec spec = new PBEKeySpec(plainPassword.toCharArray(), salt, ITERATIONS, KEY_SIZE);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // Verify password
    public static boolean verifyPassword(String plainPassword, String storedHash, byte[] salt) {
        String hashedInput = hashPassword(plainPassword, salt);
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
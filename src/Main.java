//import java.sql.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import com.google.gson.JsonElement;

import static spark.Spark.*;
//import java.util.Vector;
import java.util.Date;
import java.text.SimpleDateFormat;
//import java.util.Scanner;
import java.util.List;
import java.time.LocalDate;
import java.util.ArrayList;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.Map;
import java.util.HashMap;
import com.google.gson.stream.JsonReader;
import java.io.StringReader;
import java.util.Vector;
import static spark.Spark.staticFiles;
import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import java.nio.file.Files;
import java.nio.file.Paths;
import javax.servlet.http.Part;
import java.io.InputStream;
import java.nio.file.StandardCopyOption;

//>>>>> javac --enable-preview --release 23 -cp "lib/*" -d bin src/*.java
//>>>>> java --enable-preview -cp "bin;lib/*" Main 

//javac -d bin src/Main.java
//javac -d bin -cp "lib/*;src" src/*.java

//--Compile all the src files together and then run the MAIN program
//javac -d bin src/*.java 
//java -cp "bin;lib/sqlite-jdbc-3.46.1.3.jar" Main 
 

public class Main { 
    private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
    private static Connection[] connHolder = new Connection[1];
    private static final Gson gson = new GsonBuilder()
        .setLenient()
        .create();
    private static final String UPLOAD_DIR = "uploads";

    public static void main(String[] args) {
        String url = "jdbc:sqlite:db/umrs.db";
        final Connection[] connHolder = new Connection[1];
        
        // Database connection setup
        try {
            Class.forName("org.sqlite.JDBC");
            connHolder[0] = DriverManager.getConnection(url);
            if (connHolder[0] != null) {
                System.out.println("Connected to the database.");
                // Test the connection
                try (PreparedStatement pstmt = connHolder[0].prepareStatement("SELECT 1");
                     ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        System.out.println("Database connection test successful.");
                    }
                }
            }
        } catch (ClassNotFoundException | SQLException e) {
            System.out.println("Database connection error: " + e.getMessage());
            e.printStackTrace();
            return; // Exit if unable to connect to the database
        }
        
        // Set up Spark web server
        port(8080);

        // Enable CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }

            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }

            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Request-Method", "GET,POST,PUT,DELETE,OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin,");
            if (request.requestMethod().equals("OPTIONS")) {
                response.status(200);
                return;
            }

            // Configure multipart
            if (request.raw().getContentType() != null && 
                request.raw().getContentType().startsWith("multipart/form-data")) {
                MultipartConfigElement multipartConfigElement = new MultipartConfigElement(
                    System.getProperty("java.io.tmpdir"), // Location to store temp files
                    10 * 1024 * 1024,   // Max file size (10MB)
                    20 * 1024 * 1024,   // Max request size (20MB)
                    0                    // File size threshold after which files will be written to disk
                );
                request.raw().setAttribute("org.eclipse.jetty.multipartConfig", multipartConfigElement);
            }
        });

        // Create uploads directory if it doesn't exist
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (Exception e) {
            System.err.println("Could not create upload directory! " + e.getMessage());
        }

        // Add this at the beginning of each route
        before((request, response) -> {
            System.out.println("Received request: " + request.url());
        });

        // Move this BEFORE any other route definitions, right after your CORS setup
        // and BEFORE the /api/patient/:id route

        // Add this endpoint for medical records by PHN
        get("/api/patient/medical-records/by-phn/:personalHealthNo", (req, res) -> {
            System.out.println("\n=== Medical Records Endpoint Hit ===");
            System.out.println("Request path: " + req.pathInfo());
            System.out.println("PHN Parameter: " + req.params(":personalHealthNo"));
            
            res.type("application/json");
            try {
                String personalHealthNo = req.params(":personalHealthNo");
                System.out.println("Attempting to fetch records for PHN: " + personalHealthNo);
                
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                MedicalRecordDAO recordDAO = new MedicalRecordDAO(connHolder[0]);
                List<MedicalRecord> records = recordDAO.getRecordsByPHN(personalHealthNo);
                
                System.out.println("Found " + records.size() + " records for PHN: " + personalHealthNo);
                String jsonResponse = gson.toJson(records);
                System.out.println("Sending response: " + jsonResponse);
                return jsonResponse;
                
            } catch (Exception e) {
                System.err.println("Error in medical records endpoint: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Define API endpoints
        get("/patients", (req, res) -> {
            // TODO: Implement logic to retrieve patients from the database
            return gson.toJson(new ApiResponse("success", "List of patients"));
        });

        get("/patients/:id", (req, res) -> {
            // TODO: Implement logic to retrieve patient details from the database
            return gson.toJson(new ApiResponse("success", "Patient details for ID: " + req.params(":id")));
        });

        get("/appointments", (req, res) -> {
            // TODO: Implement logic to retrieve appointments from the database
            return gson.toJson(new ApiResponse("success", "List of appointments"));
        });

        get("/appointments/:id", (req, res) -> {
            // TODO: Implement logic to retrieve appointment details from the database
            return gson.toJson(new ApiResponse("success", "Appointment details for ID: " + req.params(":id")));
        });

        // Update the login route to match frontend expectations
        post("/api/auth/login", (req, res) -> {
            System.out.println("\n=== Login Attempt ===");
            System.out.println("Request received: " + req.body());
            
            try {
                JsonObject jsonBody = JsonParser.parseString(req.body()).getAsJsonObject();
                String username = jsonBody.get("username").getAsString();
                String password = jsonBody.get("password").getAsString();
                String portalType = jsonBody.get("portalType").getAsString();

                System.out.println("Username: " + username);
                System.out.println("Portal Type: " + portalType);

                Login2FADAO login2FADAO = new Login2FADAO(connHolder[0]);
                boolean isAuthenticated = login2FADAO.login(username, password, portalType);

                System.out.println("Authentication result: " + isAuthenticated);

                if (isAuthenticated) {
                    String response = gson.toJson(new ApiResponse("success", "Login successful"));
                    System.out.println("Sending success response: " + response);
                    return response;
                }

                res.status(401);
                String response = gson.toJson(new ApiResponse("error", "Invalid credentials"));
                System.out.println("Sending error response: " + response);
                return response;
                
            } catch (Exception e) {
                System.out.println("Login error occurred:");
                e.printStackTrace();
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Login failed: " + e.getMessage()));
            }
        });
        
        post("/login", (req, res) -> {
            try {
                JsonObject jsonBody = JsonParser.parseString(req.body()).getAsJsonObject();
                String username = jsonBody.get("username").getAsString();
                String password = jsonBody.get("password").getAsString();
                String portalType = jsonBody.get("portalType").getAsString();
                
                Login2FADAO login2FADAO = new Login2FADAO(connHolder[0]);
                boolean isAuthenticated = login2FADAO.login(username, password, portalType);
                
                if (isAuthenticated) {
                    // Get user details from Login_2FA
                    Login2FA userLogin = login2FADAO.getLoginByUsername(username);
                    
                    Map<String, Object> responseMap = new HashMap<>();
                    responseMap.put("status", "success");
                    responseMap.put("message", "Login successful");
                    responseMap.put("token", "mock-jwt-token-" + username);
                    responseMap.put("user", userLogin);
                    
                    return gson.toJson(responseMap);
                } else {
                    res.status(401);
                    return gson.toJson(new ApiResponse("error", "Invalid credentials"));
                }
            } catch (Exception e) {
                System.out.println("Login error occurred:");
                e.printStackTrace();
                
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Login failed: " + e.getMessage()));
            }
        });

        post("/signup", (req, res) -> {
            res.type("application/json");
            try {
                // Parse the JSON body
                JsonObject jsonBody = gson.fromJson(req.body(), JsonObject.class);
                System.out.println("Received request body: " + jsonBody);

                // Extract and set default values
                String userType = getStringFromJson(jsonBody, "userType");
                String password = getStringFromJson(jsonBody, "password");
                String twoFAPreference = getStringFromJson(jsonBody, "twoFAPreference");
                
                // Set defaults
                if (userType == null) userType = "patient";
                if (twoFAPreference == null) twoFAPreference = "email";
                
                // Create Login2FA entry
                Login2FA newUser = new Login2FA();
                newUser.setUserType(userType);
                newUser.setLoginPassword(password);
                newUser.setTwoFAPreference(twoFAPreference);
                newUser.setTwoFACodeTimestamp(new Date());
                
                // Create user based on type
                Login2FADAO login2FADAO = new Login2FADAO(connHolder[0]);
                boolean isCreated = login2FADAO.signup(newUser, userType);
                
                if (!isCreated) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Failed to create login entry"));
                }

                // Handle different user types
                switch (userType) {
                    case "patient":
                        Patient newPatient = new Patient();
                        String generatedPHN = newUser.getLoginUsername();
                        newPatient.setPersonalHealthNo(generatedPHN);
                        newPatient.setNIC(getStringFromJson(jsonBody, "nic"));
                        newPatient.setName(getStringFromJson(jsonBody, "name"));
                        newPatient.setDateOfBirth(getStringFromJson(jsonBody, "dateOfBirth"));
                        newPatient.setGender(getStringFromJson(jsonBody, "gender"));
                        newPatient.setAddress(getStringFromJson(jsonBody, "address"));
                        newPatient.setPhoneNumber(getStringFromJson(jsonBody, "phoneNumber"));
                        newPatient.setEmail(getStringFromJson(jsonBody, "email"));
                        newPatient.setEmergencyContactName(getStringFromJson(jsonBody, "emergencyContactName"));
                        newPatient.setEmergencyContactPhone(getStringFromJson(jsonBody, "emergencyContactPhone"));

                        PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                        patientDAO.insertPatient(newPatient);
                        return gson.toJson(new ApiResponse("success", "Registration successful", generatedPHN));

                    case "healthcare_professional":
                        // Add healthcare professional handling here if needed
                        break;

                    case "healthcare_institute":
                        // Add healthcare institute handling here if needed
                        break;

                    default:
                        res.status(400);
                        return gson.toJson(new ApiResponse("error", "Invalid user type"));
                }
                
                return gson.toJson(new ApiResponse("success", "User created successfully"));
                
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Registration failed: " + e.getMessage()));
            }
        });

        // Add these new routes
        get("/api/patient/recent-prescription", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            MedicalRecord recentPrescription = medicalRecordDAO.getRecentRecordByType(personalHealthNo, "Prescription");
            return gson.toJson(recentPrescription);
        });

        get("/api/patient/appointments", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            List<MedicalRecord> appointments = medicalRecordDAO.getRecordsByType(personalHealthNo, "Appointment");
            return gson.toJson(appointments);
        });

        get("/api/patient/activities", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            System.out.println("Fetching activities for personalHealthNo: " + personalHealthNo);
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            try {
                List<MedicalRecord> activities = medicalRecordDAO.getRecentRecords(personalHealthNo, 10);
                System.out.println("Retrieved " + activities.size() + " activities");
                return gson.toJson(activities);
            } catch (SQLException e) {
                System.out.println("Error retrieving recent records: " + e.getMessage());
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        get("/api/patient/recent-test", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            try {
                MedicalRecord recentTest = medicalRecordDAO.getRecentRecordByType(personalHealthNo, "Test");
                return gson.toJson(recentTest);
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        get("/api/patient/recent-medical-record", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            try {
                MedicalRecord recentRecord = medicalRecordDAO.getRecentRecord(personalHealthNo);
                return gson.toJson(recentRecord);
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        // API endpoint to get patient data
        get("/api/patient", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            PatientDAO patientDAO = new PatientDAO(connHolder[0]);
            Patient patient = patientDAO.getPatient(personalHealthNo);
            if (patient != null) {
                return gson.toJson(patient);
            } else {
                res.status(404);
                return gson.toJson(new ApiResponse("error", "Patient not found"));
            }
        });

        // API endpoint to get recent diagnosis from medical records
        get("/api/patient/recent-diagnosis", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            MedicalRecordDAO recordDAO = new MedicalRecordDAO(connHolder[0]);
            List<MedicalRecord> diagnoses = recordDAO.getRecordsByType(personalHealthNo, "Diagnosis");
            return gson.toJson(diagnoses);
        });

        // API endpoint to get ongoing prescriptions
        get("/api/patient/ongoing-prescriptions", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            try {
                MedicalRecordDAO recordDAO = new MedicalRecordDAO(connHolder[0]);
                List<MedicalRecord> prescriptions = recordDAO.getRecordsByType(personalHealthNo, "Prescription");
                return gson.toJson(prescriptions);
            } catch (SQLException e) {
                // Log the error
                e.printStackTrace();
                // Return an error response
                return "Error: Unable to retrieve prescriptions due to a database error.";
            }
        });

        // Add this new route for creating medical records
        post("/api/patient/medical-records", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                // Extract and validate PHN
                String personalHealthNo = getStringFromJson(jsonRequest, "personalHealthNo");
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                MedicalRecord record = new MedicalRecord();
                record.setPersonalHealthNo(personalHealthNo);
                record.setSlmcNo(getStringFromJson(jsonRequest, "slmcNo"));
                record.setHealthInstituteNumber(getStringFromJson(jsonRequest, "healthInstituteNumber"));
                record.setDateOfVisit(LocalDate.parse(getStringFromJson(jsonRequest, "dateOfVisit")));
                record.setDiagnosis(getStringFromJson(jsonRequest, "diagnosis"));
                record.setTreatment(getStringFromJson(jsonRequest, "treatment"));
                record.setNotes(getStringFromJson(jsonRequest, "notes"));
                record.setType(getStringFromJson(jsonRequest, "type"));
                record.setSummary(getStringFromJson(jsonRequest, "summary"));

                // Log the record data before insertion
                System.out.println("Inserting medical record with PHN: " + personalHealthNo);

                MedicalRecordDAO recordDAO = new MedicalRecordDAO(connHolder[0]);
                recordDAO.insertMedicalRecord(record);

                return gson.toJson(new ApiResponse("success", "Medical record created successfully", Integer.valueOf(record.getRecordId())));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to create medical record: " + e.getMessage()));
            }
        });

        // Route to get a specific medical record
        get("/api/patient/medical-records/:id", (req, res) -> {
            String id = req.params(":id");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            try {
                MedicalRecord record = medicalRecordDAO.getMedicalRecordById(id);
                if (record != null) {
                    return gson.toJson(record);
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Medical record not found"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        // Route to update a medical record
        put("/api/patient/medical-records/:id", (req, res) -> {
            String id = req.params(":id");
            JsonObject jsonBody = JsonParser.parseString(req.body()).getAsJsonObject();
            
            MedicalRecord updatedRecord = gson.fromJson(jsonBody, MedicalRecord.class);
            updatedRecord.setRecordId(Integer.parseInt(id));

            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            try {
                boolean updated = medicalRecordDAO.updateMedicalRecord(updatedRecord);
                if (updated) {
                    return gson.toJson(new ApiResponse("success", "Medical record updated successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Medical record not found or not updated"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        // Route to delete a medical record
        delete("/api/patient/medical-records/:id", (req, res) -> {
            String id = req.params(":id");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            try {
                boolean deleted = medicalRecordDAO.deleteMedicalRecord(id);
                if (deleted) {
                    return gson.toJson(new ApiResponse("success", "Medical record deleted successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Medical record not found or not deleted"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        // Error handling
        exception(Exception.class, (e, req, res) -> {
            e.printStackTrace(); // Print full stack trace for debugging
            res.status(500);
            res.body(gson.toJson(new ApiResponse("error", "Internal server error: " + e.getMessage())));
        });

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                if (connHolder[0] != null) connHolder[0].close();
            } catch (SQLException e) {
                System.out.println("Error closing database connection: " + e.getMessage());
            }
        }));

        get("/api/current-user", (req, res) -> {
            res.type("application/json");
            String username = req.queryParams("username");
            
            if (username != null && !username.isEmpty()) {
                try {
                    PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                    Patient patient = patientDAO.getPatientByUsername(username);
                    
                    if (patient != null) {
                        return gson.toJson(patient);
                    } else {
                        res.status(404);
                        return gson.toJson(new ApiResponse("error", "User not found"));
                    }
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
                }
            } else {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Username parameter is required"));
            }
        });

     
        try {
            Statement stmt = connHolder[0].createStatement();
            ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='PATIENT'");
            if (!rs.next()) {
                System.err.println("PATIENT table does not exist in the database!");
                // Optionally, you could create the table here if it doesn't exist
            } else {
                System.out.println("PATIENT table exists in the database.");
            }
        } catch (SQLException e) {
            System.err.println("Error checking for PATIENT table: " + e.getMessage());
            e.printStackTrace();
        }

        // Add this endpoint to handle patient data requests
        get("/api/patient", (req, res) -> {
            res.type("application/json");
            try {
                String personalHealthNo = req.queryParams("personalHealthNo");
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Username is required"));
                }

                // Get patient data from database
                PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                Patient patient = patientDAO.getPatient(personalHealthNo);

                if (patient == null) {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Patient not found"));
                }

                return gson.toJson(patient);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Add this endpoint to handle medical records requests
        get("/api/patient/medical-records", (req, res) -> {
            res.type("application/json");
            try {
                String personalHealthNo = req.queryParams("personalHealthNo");
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                // Get medical records from database
                MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
                List<MedicalRecord> records = medicalRecordDAO.getRecordsByPHN(personalHealthNo);

                return gson.toJson(records);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Add this after the login endpoint
        get("/api/auth/me", (req, res) -> {
            res.type("application/json");
            
            // Get the token from the Authorization header
            String authHeader = req.headers("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                res.status(401);
                return gson.toJson(new ApiResponse("error", "No authentication token provided"));
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            try {
                // TODO: Implement proper JWT validation
                // For now, we'll just check if there's a token and return mock user data
                if (token != null && !token.isEmpty()) {
                    // Get username from token (this should be replaced with proper JWT validation)
                    String username = "mockUsername"; // Replace with actual username extraction from token
                    
                    PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                    Patient patient = patientDAO.getPatientByUsername(username);
                    
                    if (patient != null) {
                        return gson.toJson(patient);
                    } else {
                        res.status(404);
                        return gson.toJson(new ApiResponse("error", "User not found"));
                    }
                } else {
                    res.status(401);
                    return gson.toJson(new ApiResponse("error", "Invalid token"));
                }
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        get("/api/patient/dashboard", (req, res) -> {
            res.type("application/json");
            try {
                String personalHealthNo = req.queryParams("personalHealthNo");
                System.out.println("PHN received: " + personalHealthNo);

                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                Patient patient = patientDAO.getPatientByPHN(personalHealthNo);

                if (patient != null) {
                    Map<String, Object> dashboardData = new HashMap<>();
                    dashboardData.put("patient", patient);
                    // Add any other dashboard data you need
                    return gson.toJson(dashboardData);
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Patient not found"));
                }
            } catch (Exception e) {
                System.out.println("Error in dashboard endpoint: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch dashboard data"));
            }
        });

        // Add this endpoint if not already present
        get("/api/patient/:personalHealthNo", (req, res) -> {
            res.type("application/json");
            try {
                String personalHealthNo = req.params(":personalHealthNo");
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                Patient patient = patientDAO.getPatient(personalHealthNo);

                if (patient != null) {
                    return gson.toJson(patient);
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Patient not found"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Add these endpoints after your existing routes
        get("/api/patient/medical-documents", (req, res) -> {
            res.type("application/json");
            try {
                String personalHealthNo = req.queryParams("personalHealthNo");
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                MedicalDocumentDAO documentDAO = new MedicalDocumentDAO(connHolder[0]);
                Vector<MedicalDocument> documents = documentDAO.getDocumentsByPatient(personalHealthNo);
                return gson.toJson(documents);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        post("/api/patient/medical-documents/upload", (req, res) -> {
            res.type("application/json");
            
            try {
                req.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/tmp"));
                
                String recordId = req.queryParams("recordId");
                if (recordId == null || recordId.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Record ID is required"));
                }

                Part filePart = req.raw().getPart("file");
                if (filePart == null) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "No file uploaded"));
                }

                // Create unique filename
                String fileName = System.currentTimeMillis() + "_" + filePart.getSubmittedFileName();
                String filePath = Paths.get(UPLOAD_DIR, fileName).toString();

                // Save file
                try (InputStream inputStream = filePart.getInputStream()) {
                    Files.copy(inputStream, Paths.get(filePath));
                }

                // Create document record
                MedicalDocument document = new MedicalDocument(
                    Integer.parseInt(recordId),
                    filePart.getContentType(),
                    filePath,
                    new java.sql.Date(System.currentTimeMillis()),
                    "system", // Replace with actual user info when available
                    filePart.getSubmittedFileName()
                );

                MedicalDocumentDAO documentDAO = new MedicalDocumentDAO(connHolder[0]);
                documentDAO.insertMedicalDocument(document);

                return gson.toJson(new ApiResponse("success", "Document uploaded successfully"));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Upload failed: " + e.getMessage()));
            }
        });

        delete("/api/patient/medical-documents/:id", (req, res) -> {
            res.type("application/json");
            try {
                int documentId = Integer.parseInt(req.params(":id"));
                MedicalDocumentDAO documentDAO = new MedicalDocumentDAO(connHolder[0]);
                documentDAO.deleteMedicalDocument(documentId);
                return gson.toJson(new ApiResponse("success", "Document deleted successfully"));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Delete failed: " + e.getMessage()));
            }
        });

        // Add this configuration before your routes
        staticFiles.externalLocation("uploads");
        before((request, response) -> {
            if (request.raw().getContentType() != null && 
                request.raw().getContentType().startsWith("multipart/form-data")) {
                MultipartConfigElement multipartConfigElement = new MultipartConfigElement("/tmp");
                request.raw().setAttribute("org.eclipse.jetty.multipartConfig", multipartConfigElement);
            }
        });
    }

    // Move this method outside of main
    private static String getUserPHNFromSession(spark.Request req) {
        // Implementation depends on how you're storing user session data
        // This is just a placeholder
        return null;
    }

    // Simple API response class
    private static class ApiResponse {
        private String status;
        private String message;
        private String personalHealthNo;  
        private Integer recordId;  // Add this field

        // Basic constructor
        public ApiResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }

        // Constructor with personalHealthNo
        public ApiResponse(String status, String message, String personalHealthNo) {
            this.status = status;
            this.message = message;
            this.personalHealthNo = personalHealthNo;
        }

        // Constructor with recordId
        public ApiResponse(String status, String message, Integer recordId) {
            this.status = status;
            this.message = message;
            this.recordId = recordId;
        }

        // Getters and setters
        public String getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }

        public String getPersonalHealthNo() {
            return personalHealthNo;
        }

        public Integer getRecordId() {
            return recordId;
        }
    }

    private static String getStringFromJson(JsonObject json, String key) {
        try {
            JsonElement element = json.get(key);
            return (element != null && !element.isJsonNull()) ? element.getAsString() : null;
        } catch (Exception e) {
            System.err.println("Error getting " + key + " from JSON: " + e.getMessage());
            return null;
        }
    }

    private static String generateJWTToken(Patient patient) {
        // TODO: Implement proper JWT token generation
        // For now, return a mock token
        return "mock-jwt-token-" + patient.getPersonalHealthNo();
    }
}

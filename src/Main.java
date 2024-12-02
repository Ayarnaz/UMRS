//import java.sql.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.DatabaseMetaData;
import javax.sql.DataSource;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import com.google.gson.JsonElement;

import static spark.Spark.*;
//import java.util.Vector;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.stream.Collectors;
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
import java.time.LocalDateTime;

import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import java.nio.file.Files;
import java.nio.file.Paths;
import javax.servlet.http.Part;
import java.io.InputStream;
import java.nio.file.StandardCopyOption;
import java.util.Random;
import java.util.Base64;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.util.TimeZone;
import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.text.ParseException;




//javac --enable-preview --release 23 -cp "lib/*" -d bin src/*.java > server.log 2>&1
//java --enable-preview -cp "bin;lib/*" Main 
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
    private static HikariDataSource dataSource;
    private static final Object DB_LOCK = new Object();
    private static RecordAccessDAO recordAccessDAO;
    private static RecordSharingDAO recordSharingDAO;

    // Initialize the connection pool
    private static void initializeDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:sqlite:db/umrs.db");
        config.setMaximumPoolSize(10);          // Reduced pool size
        config.setMinimumIdle(5);               // Reduced idle connections
        config.setConnectionTimeout(30000);      // 30 seconds
        config.setIdleTimeout(300000);          // 5 minutes
        config.setMaxLifetime(900000);          // 15 minutes
        config.setConnectionTestQuery("SELECT 1");
        
        // SQLite specific optimizations
        config.addDataSourceProperty("journal_mode", "WAL");       // Write-Ahead Logging
        config.addDataSourceProperty("synchronous", "NORMAL");     // Better performance with acceptable safety
        config.addDataSourceProperty("cache_size", "-2000");      // 2MB cache
        config.addDataSourceProperty("busy_timeout", "30000");    // 30 second timeout
        config.addDataSourceProperty("temp_store", "MEMORY");     // Store temp tables in memory
        config.addDataSourceProperty("mmap_size", "30000000000"); // 30GB memory-mapped I/O
        
        // Add these new properties
        config.addDataSourceProperty("foreign_keys", "ON");
        config.addDataSourceProperty("default_timeout", "30000");
        config.addDataSourceProperty("transaction_mode", "IMMEDIATE");
        
        dataSource = new HikariDataSource(config);
    }

    // getConnection method
    private static Connection getConnection() throws SQLException {
        synchronized (DB_LOCK) {
            Connection conn = getPooledConnection();
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("PRAGMA busy_timeout = 30000");
                stmt.execute("PRAGMA temp_store = MEMORY");
                stmt.execute("PRAGMA cache_size = -2000");
            }
            return conn;
        }
    }

    private static Connection getPooledConnection() throws SQLException {
        if (dataSource == null) {
            throw new SQLException("DataSource not initialized");
        }
        Connection conn = dataSource.getConnection();
        conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
        return conn;
    }

    public static void main(String[] args) {
        // Initialize HikariCP first
        initializeDataSource();
        System.out.println("DataSource initialized: " + (dataSource != null));
        
        // Initialize RecordAccessDAO after dataSource
        recordAccessDAO = new RecordAccessDAO(dataSource); // Pass dataSource to constructor
        
        // Initialize RecordSharingDAO after dataSource
        recordSharingDAO = new RecordSharingDAO(dataSource);
        
        String url = "jdbc:sqlite:db/umrs.db";
        
        // 1. Configure static files FIRST
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            staticFiles.externalLocation(UPLOAD_DIR);
        } catch (Exception e) {
            System.err.println("Could not create upload directory! " + e.getMessage());
        }

        // 2. Set up port
        port(8080);

        // 3. Configure CORS with proper lambda syntax
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }

            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            }

            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "http://localhost:3000");
            response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin");
            
            if (request.requestMethod().equals("OPTIONS")) {
                halt(200);
            }

            if (request.raw().getContentType() != null && 
                request.raw().getContentType().startsWith("multipart/form-data")) {
                MultipartConfigElement multipartConfigElement = new MultipartConfigElement(
                    System.getProperty("java.io.tmpdir"),
                    10 * 1024 * 1024,   // Max file size (10MB)
                    20 * 1024 * 1024,   // Max request size (20MB)
                    0                    // File size threshold
                );
                request.raw().setAttribute("org.eclipse.jetty.multipartConfig", multipartConfigElement);
            }
        });

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
        
        // Add this at the beginning of each route
        before((request, response) -> {
            System.out.println("Received request: " + request.url());
        });

        // This should beBEFORE any other route definitions, right after the CORS setup (Cross-origin resource sharing (CORS))
        // and BEFORE the /api/patient/:id route

        // endpoint for medical records by PHN
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

                // Use the shared connection from connHolder
                Login2FADAO login2FADAO = new Login2FADAO(connHolder[0]);
                boolean isAuthenticated = login2FADAO.login(username, password, portalType);

                System.out.println("Authentication result: " + isAuthenticated);

                if (isAuthenticated) {
                    // Get user details using the same connection
                    Login2FA userLogin = login2FADAO.getLoginByUsername(username);
                    
                    Map<String, Object> responseMap = new HashMap<>();
                    responseMap.put("status", "success");
                    responseMap.put("message", "Login successful");
                    responseMap.put("token", "mock-jwt-token-" + username);
                    responseMap.put("user", userLogin);
                    
                    String response = gson.toJson(responseMap);
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
            res.type("application/json");
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

        post("/api/auth/signup/:userType", (req, res) -> {
            res.type("application/json");
            String userType = req.params(":userType");
            Connection conn = null;
            
            try {
                JsonObject jsonBody = gson.fromJson(req.body(), JsonObject.class);
                System.out.println("Received signup request for " + userType + ": " + jsonBody);
                
                conn = dataSource.getConnection();
                conn.setAutoCommit(false);
                
                // Create Login2FA object first with password
                Login2FA login2FA = new Login2FA();
                login2FA.setUserType(userType);
                login2FA.setTwoFAPreference(jsonBody.get("twoFAPreference").getAsString());
                login2FA.setPortalType(userType);
                login2FA.setLastTwoFACode(generateSecret());
                login2FA.setLoginPassword(jsonBody.get("password").getAsString());  // Set password early
                
                String identifier = null;
                
                try {
                    switch (userType) {
                        case "patient":
                            Patient newPatient = new Patient();
                            newPatient.setName(jsonBody.get("fullName").getAsString());
                            newPatient.setDateOfBirth(jsonBody.get("dateOfBirth").getAsString());
                            newPatient.setGender(jsonBody.get("gender").getAsString());
                            newPatient.setAddress(jsonBody.get("address").getAsString());
                            newPatient.setPhoneNumber(jsonBody.get("contactNo").getAsString());
                            newPatient.setEmail(jsonBody.get("email").getAsString());
                            newPatient.setNIC(jsonBody.get("nic").getAsString());
                            
                            // Generate PHN
                            Login2FADAO tempDao = new Login2FADAO(conn);
                            String generatedPHN = tempDao.getIdentifierForUser("patient");
                            newPatient.setPersonalHealthNo(generatedPHN);
                            identifier = generatedPHN;
                            
                            // Insert patient
                            PatientDAO patientDAO = new PatientDAO(conn);
                            patientDAO.insertPatient(newPatient);
                            
                            // Set login details
                            login2FA.setUserIdentifier(identifier);
                            login2FA.setLoginUsername(identifier);
                            break;
                            
                        case "professional":
                            HealthcareProfessional newProfessional = new HealthcareProfessional();
                            newProfessional.setName(jsonBody.get("fullName").getAsString());
                            newProfessional.setSlmcNo(jsonBody.get("slmcNumber").getAsString());
                            newProfessional.setSpecialty(jsonBody.get("specialty").getAsString());
                            newProfessional.setRole(jsonBody.get("role").getAsString());
                            newProfessional.setEmail(jsonBody.get("email").getAsString());
                            newProfessional.setPhoneNumber(jsonBody.get("contactNo").getAsString());
                            newProfessional.setAddress(jsonBody.get("address").getAsString());
                            newProfessional.setNic(jsonBody.get("nic").getAsString());
                            newProfessional.setHealthInstituteNumber(jsonBody.get("healthInstituteNumber").getAsString());
                            
                            identifier = newProfessional.getSlmcNo();
                            
                            // Insert professional
                            HealthcareProfessionalDAO professionalDAO = new HealthcareProfessionalDAO(conn);
                            professionalDAO.insertHealthcareProfessional(newProfessional);

                            login2FA.setUserIdentifier(identifier);
                            login2FA.setLoginUsername(identifier);
                            break;

                        case "institute":
                            HealthcareInstitute newInstitute = new HealthcareInstitute(
                                jsonBody.get("instituteNumber").getAsString(),
                                jsonBody.get("instituteName").getAsString(),
                                jsonBody.get("address").getAsString(),
                                jsonBody.get("email").getAsString(),
                                jsonBody.get("contactNo").getAsString(),
                                jsonBody.get("instituteType").getAsString()
                            );
                            
                            identifier = newInstitute.getHealthInstituteNumber();
                            
                            // Insert institute
                            HealthcareInstituteDAO instituteDAO = new HealthcareInstituteDAO(conn);
                            instituteDAO.insertHealthcareInstitute(newInstitute);

                            login2FA.setUserIdentifier(identifier);
                            login2FA.setLoginUsername(identifier);
                            break;
                    }

                    // Now handle Login2FA signup
                    if (identifier != null) {
                        Login2FADAO login2FADao = new Login2FADAO(conn);
                        boolean loginCreated = login2FADao.signup(login2FA, userType);

                        if (loginCreated) {
                            conn.commit();
                            return gson.toJson(new ApiResponse("success", 
                                userType + " registration successful. Your identifier is: " + identifier,
                                identifier));
                        }
                    }
                    
                    throw new Exception("Failed to complete registration");
                    
                } catch (Exception e) {
                    if (conn != null) {
                        conn.rollback();
                    }
                    throw e;
                }
                
            } catch (Exception e) {
                System.err.println("Error in signup endpoint: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Registration failed: " + e.getMessage()));
            } finally {
                if (conn != null) {
                    try {
                        conn.setAutoCommit(true);
                        conn.close();
                    } catch (SQLException e) {
                        System.err.println("Error closing connection: " + e.getMessage());
                    }
                }
            }
        });

        // Add these new routes
        get("/api/patient/recent-prescription", (req, res) -> {
            String personalHealthNo = req.queryParams("personalHealthNo");
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            List<MedicalRecord> prescriptions = medicalRecordDAO.getRecentPrescriptions(personalHealthNo);
            return gson.toJson(prescriptions);
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
            MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
            List<MedicalRecord> diagnoses = medicalRecordDAO.getRecentDiagnoses(personalHealthNo);
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
            System.out.println("Inserting medical record from patient portal");
            
            try {
                String requestBody = req.body();
                MedicalRecord record = gson.fromJson(requestBody, MedicalRecord.class);
                System.out.println("Inserting medical record with PHN: " + record.getPersonalHealthNo());
                
                // Get a fresh connection from the pool
                try (Connection conn = getConnection()) {
                    // Set timeout and isolation level
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute("PRAGMA busy_timeout = 60000");  // 60 second timeout
                        stmt.execute("PRAGMA journal_mode = WAL");
                    }
                    
                    conn.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE);
                    conn.setAutoCommit(false);
                    
                    // Create DAO with this connection
                    MedicalRecordDAO recordDAO = new MedicalRecordDAO(conn);
                    
                    // Insert with retry logic
                    int maxRetries = 3;
                    int retryCount = 0;
                    boolean success = false;
                    
                    while (!success && retryCount < maxRetries) {
                        try {
                            recordDAO.insertMedicalRecord(record);
                            conn.commit();
                            success = true;
                        } catch (SQLException e) {
                            if (e.getMessage().contains("database is locked") && retryCount < maxRetries - 1) {
                                System.out.println("Database locked, retrying... (attempt " + (retryCount + 1) + ")");
                                retryCount++;
                                Thread.sleep(1000); // Wait 1 second before retrying
                                conn.rollback();
                            } else {
                                throw e;
                            }
                        }
                    }
                    
                    if (success) {
                        return gson.toJson(new ApiResponse("success", "Record added successfully"));
                    } else {
                        throw new SQLException("Failed to insert record after " + maxRetries + " attempts");
                    }
                }
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
            String phn = req.queryParams("phn");
            
            if (phn == null || phn.trim().isEmpty()) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
            }

            System.out.println("\n=== Fetching Patient Records ===");
            System.out.println("PHN: " + phn);
            
            try (Connection conn = getConnection()) {
                conn.setAutoCommit(false);
                conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
                
                // Get all records including newly added ones
                MedicalRecordDAO recordDAO = new MedicalRecordDAO(conn);
                List<MedicalRecord> allRecords = recordDAO.getRecordsByPHN(phn); // Using the same method name pattern
                System.out.println("Retrieved " + allRecords.size() + " total records");

                conn.commit();
                
                Map<String, Object> response = new HashMap<>();
                response.put("medicalRecords", allRecords);
                
                return gson.toJson(response);

            } catch (Exception e) {
                System.err.println("Error fetching patient records: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch records"));
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
        get("/api/patient/medical-documents/by-phn/:personalHealthNo", (req, res) -> {
            res.type("application/json");
            try {
                String personalHealthNo = req.params(":personalHealthNo");
                System.out.println("Fetching documents for PHN: " + personalHealthNo);
                
                if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                MedicalDocumentDAO documentDAO = new MedicalDocumentDAO(connHolder[0]);
                Vector<MedicalDocument> documents = documentDAO.getDocumentsByPatient(personalHealthNo);
                
                // Debug logging
                System.out.println("Fetched documents: " + documents.size());
                for (MedicalDocument doc : documents) {
                    System.out.println("Document ID: " + doc.getDocumentID() + 
                                        ", Record ID: " + doc.getRecordID());
                }
                
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
                // Get the uploaded file
                Part filePart = req.raw().getPart("file");
                String recordId = req.raw().getParameter("recordId");
                String documentType = req.raw().getParameter("documentType");
                String details = req.raw().getParameter("details");
                String personalHealthNo = req.raw().getParameter("personalHealthNo");

                // Debug logging
                System.out.println("Received upload request with:");
                System.out.println("Record ID: " + recordId);
                System.out.println("Document Type: " + documentType);
                System.out.println("PHN: " + personalHealthNo);
                System.out.println("File name: " + (filePart != null ? filePart.getSubmittedFileName() : "no file"));

                // Validation
                if (recordId == null || recordId.trim().isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Record ID is required"));
                }

                if (personalHealthNo == null || personalHealthNo.trim().isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
                }

                if (filePart == null) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "No file uploaded"));
                }

                // Create unique filename
                String fileName = System.currentTimeMillis() + "_" + filePart.getSubmittedFileName();
                String filePath = Paths.get(UPLOAD_DIR, fileName).toString();

                // Ensure upload directory exists
                Files.createDirectories(Paths.get(UPLOAD_DIR));

                // Save file
                try (InputStream inputStream = filePart.getInputStream()) {
                    Files.copy(inputStream, Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);
                }

                // Create document record
                MedicalDocument document = new MedicalDocument(
                    recordId,
                    personalHealthNo,
                    documentType,
                    details,
                    filePath,
                    new java.sql.Date(System.currentTimeMillis()),
                    "system"
                );

                // Save to database
                MedicalDocumentDAO documentDAO = new MedicalDocumentDAO(connHolder[0]);
                documentDAO.insertMedicalDocument(document);

                return gson.toJson(new ApiResponse("success", "Document uploaded successfully"));
            } catch (Exception e) {
                System.err.println("Error in document upload: " + e.getMessage());
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
        before((request, response) -> {
            if (request.raw().getContentType() != null && 
                request.raw().getContentType().startsWith("multipart/form-data")) {
                MultipartConfigElement multipartConfigElement = new MultipartConfigElement("/tmp");
                request.raw().setAttribute("org.eclipse.jetty.multipartConfig", multipartConfigElement);
            }
        });

        // Add these endpoints after your existing routes but before the end of main()
        post("/api/patient/appointments", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                // Parse the appointment data with proper date handling
                Appointment appointment = new Appointment();
                appointment.setPersonalHealthNo(jsonRequest.get("personalHealthNo").getAsString());
                appointment.setSlmcNo(jsonRequest.get("slmcNo").getAsString());
                appointment.setHealthInstituteNumber(
                    jsonRequest.has("healthInstituteNumber") ? 
                    jsonRequest.get("healthInstituteNumber").getAsString() : ""
                );
                
                // Parse date and time
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
                
                java.util.Date parsedDate = dateFormat.parse(jsonRequest.get("appointmentDate").getAsString());
                java.util.Date parsedTime = timeFormat.parse(jsonRequest.get("appointmentTime").getAsString());
                
                appointment.setAppointmentDate(new java.sql.Date(parsedDate.getTime()));
                appointment.setAppointmentTime(new java.sql.Time(parsedTime.getTime()));
                
                appointment.setPurpose(jsonRequest.get("purpose").getAsString());
                appointment.setStatus("Pending"); // Default status for patient appointments
                appointment.setNotes(
                    jsonRequest.has("notes") ? 
                    jsonRequest.get("notes").getAsString() : ""
                );
                
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                appointmentDAO.insertAppointment(appointment);
                
                return gson.toJson(new ApiResponse("success", "Appointment created successfully"));
            } catch (ParseException e) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Invalid date format: " + e.getMessage()));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to create appointment: " + e.getMessage()));
            }
        });

        // Professional appointment endpoint
        post("/api/professional/appointments", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                // Validate required fields
                String[] requiredFields = {"patientPHN", "slmcNo", "appointmentDate", "appointmentTime", "purpose"};
                for (String field : requiredFields) {
                    if (!jsonRequest.has(field) || jsonRequest.get(field).getAsString().trim().isEmpty()) {
                        res.status(400);
                        return gson.toJson(new ApiResponse("error", "Missing required field: " + field));
                    }
                }

                Appointment appointment = new Appointment();
                appointment.setPersonalHealthNo(jsonRequest.get("patientPHN").getAsString());
                appointment.setSlmcNo(jsonRequest.get("slmcNo").getAsString());
                
                // Parse date and time
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
                
                java.util.Date parsedDate = dateFormat.parse(jsonRequest.get("appointmentDate").getAsString());  // Removed extra parenthesis
                java.util.Date parsedTime = timeFormat.parse(jsonRequest.get("appointmentTime").getAsString());  // Removed extra parenthesis
                
                appointment.setAppointmentDate(new java.sql.Date(parsedDate.getTime()));
                appointment.setAppointmentTime(new java.sql.Time(parsedTime.getTime()));
                
                appointment.setPurpose(jsonRequest.get("purpose").getAsString());
                appointment.setStatus("Scheduled"); // Professional-created appointments are automatically scheduled
                appointment.setNotes(
                    jsonRequest.has("notes") ? 
                    jsonRequest.get("notes").getAsString() : ""
                );
                appointment.setHealthInstituteNumber(
                    jsonRequest.has("healthInstituteNumber") ? 
                    jsonRequest.get("healthInstituteNumber").getAsString() : ""
                );

                AppointmentDAO appointmentDAO = new AppointmentDAO();
                appointmentDAO.insertAppointment(appointment);
                
                return gson.toJson(new ApiResponse("success", "Appointment created successfully"));
            } catch (ParseException e) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Invalid date format: " + e.getMessage()));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to create appointment: " + e.getMessage()));
            }
        });

        // Update appointment status endpoint
        put("/api/appointments/:id/status", (req, res) -> {
            res.type("application/json");
            try {
                int appointmentId = Integer.parseInt(req.params(":id"));
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                String status = jsonRequest.get("status").getAsString();
                
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                Appointment appointment = appointmentDAO.getAppointmentById(appointmentId);
                
                if (appointment != null) {
                    appointment.setStatus(status);
                    appointmentDAO.updateAppointment(appointment);
                    return gson.toJson(new ApiResponse("success", "Appointment status updated successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Appointment not found"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to update appointment status: " + e.getMessage()));
            }
        });

        // Add a GET endpoint to fetch appointments
        get("/api/patient/appointments/list", (req, res) -> {
            res.type("application/json");
            String personalHealthNo = req.queryParams("personalHealthNo");
            
            if (personalHealthNo == null || personalHealthNo.isEmpty()) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Personal Health Number is required"));
            }

            AppointmentDAO appointmentDAO = new AppointmentDAO();
            Vector<Appointment> appointments = appointmentDAO.getAppointmentsByPatient(personalHealthNo);
            
            List<Map<String, Object>> formattedAppointments = new ArrayList<>();
            for (Appointment apt : appointments) {
                Map<String, Object> formattedApt = new HashMap<>();
                formattedApt.put("id", apt.getAppointmentID());
                formattedApt.put("appointmentDate", apt.getAppointmentDate().toString());
                formattedApt.put("appointmentTime", apt.getAppointmentTime().toString());
                formattedApt.put("purpose", apt.getPurpose());
                formattedApt.put("status", apt.getStatus());
                formattedApt.put("notes", apt.getNotes());
                formattedApt.put("slmcNo", apt.getSlmcNo());
                formattedApt.put("healthInstituteNumber", apt.getHealthInstituteNumber());
                formattedAppointments.add(formattedApt);
            }
            
            return gson.toJson(formattedAppointments);
        });

        // Add this endpoint to check appointments directly
        get("/api/debug/appointments/:personalHealthNo", (req, res) -> {
            res.type("application/json");
            String personalHealthNo = req.params(":personalHealthNo");
            
            try (Connection conn = getConnection()) {
                String sql = "SELECT * FROM Appointment WHERE Personal_Health_No = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, personalHealthNo);
                    ResultSet rs = pstmt.executeQuery();
                    
                    // Debug print all fields
                    while (rs.next()) {
                        System.out.println("Found appointment:");
                        System.out.println("ID: " + rs.getInt("Appointment_ID"));
                        System.out.println("PHN: " + rs.getString("Personal_Health_No"));
                        System.out.println("Date: " + rs.getDate("Appointment_Date"));
                        System.out.println("Time: " + rs.getTime("Appointment_Time"));
                        System.out.println("Status: " + rs.getString("Status"));
                        System.out.println("-------------------");
                    }
                }
                return "{\"message\": \"Debug info printed to console\"}";
            } catch (SQLException e) {
                e.printStackTrace();
                return "{\"error\": \"" + e.getMessage() + "\"}";
            }
        });

        // Add this endpoint to check appointments for a specific patient
        get("/api/debug/check-patient-appointments/:personalHealthNo", (req, res) -> {
            res.type("application/json");
            String personalHealthNo = req.params(":personalHealthNo");
            
            try (Connection conn = getConnection()) {
                String sql = "SELECT * FROM Appointment WHERE Personal_Health_No = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, personalHealthNo);
                    ResultSet rs = pstmt.executeQuery();
                    
                    StringBuilder debug = new StringBuilder("Appointments for PHN " + personalHealthNo + ":\n");
                    boolean hasAppointments = false;
                    
                    while (rs.next()) {
                        hasAppointments = true;
                        debug.append(String.format(
                            "ID: %d, Date: %s, Time: %s, Purpose: %s, Status: %s\n",
                            rs.getInt("Appointment_ID"),
                            rs.getDate("Appointment_Date"),
                            rs.getTime("Appointment_Time"),
                            rs.getString("Purpose"),
                            rs.getString("Status")
                        ));
                    }
                    
                    if (!hasAppointments) {
                        debug.append("No appointments found for this patient.");
                    }
                    
                    System.out.println(debug.toString());
                    return "{\"message\": \"Check server console for debug output\"}";
                }
            } catch (SQLException e) {
                e.printStackTrace();
                return "{\"error\": \"" + e.getMessage() + "\"}";
            }
        });

        // Check if table exists and show its structure
        get("/api/debug/table-info", (req, res) -> {
            res.type("application/json");
            
            try (Connection conn = getConnection()) {
                // Just check for existing data
                Statement stmt = conn.createStatement();
                
                // Count records
                ResultSet count = stmt.executeQuery("SELECT COUNT(*) as count FROM Appointment");
                count.next();
                int totalRecords = count.getInt("count");
                System.out.println("\nTotal appointments in database: " + totalRecords);
                
                // Show sample data
                ResultSet data = stmt.executeQuery("SELECT * FROM Appointment");
                System.out.println("\nAll appointments:");
                while (data.next()) {
                    System.out.println(
                        "ID: " + data.getInt("Appointment_ID") + 
                        ", PHN: " + data.getString("Personal_Health_No") +
                        ", Date: " + data.getDate("Appointment_Date") +
                        ", Time: " + data.getTime("Appointment_Time") +
                        ", Status: " + data.getString("Status")
                    );
                }
                
                return "{\"message\": \"Found " + totalRecords + " appointments. Check server console.\"}";
            } catch (SQLException e) {
                e.printStackTrace();
                return "{\"error\": \"" + e.getMessage() + "\"}";
            }
        });

        // Check specific patient's appointments with detailed error handling
        get("/api/debug/patient-appointments-verbose/:phn", (req, res) -> {
            res.type("application/json");
            String phn = req.params(":phn");
            
            try (Connection conn = getConnection()) {
                System.out.println("Checking appointments for PHN: " + phn);
                
                String sql = "SELECT * FROM Appointment WHERE Personal_Health_No = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, phn);
                    System.out.println("Executing query: " + sql + " with PHN: " + phn);
                    
                    ResultSet rs = pstmt.executeQuery();
                    int count = 0;
                    
                    while (rs.next()) {
                        count++;
                        System.out.println(String.format(
                            "Found appointment %d:\n" +
                            "ID: %d\n" +
                            "PHN: %s\n" +
                            "Date: %s\n" +
                            "Time: %s\n" +
                            "Status: %s\n" +
                            "Purpose: %s\n" +
                            "-------------------",
                            count,
                            rs.getInt("Appointment_ID"),
                            rs.getString("Personal_Health_No"),
                            rs.getDate("Appointment_Date"),
                            rs.getTime("Appointment_Time"),
                            rs.getString("Status"),
                            rs.getString("Purpose")
                        ));
                    }
                    
                    System.out.println("Total appointments found: " + count);
                    return "{\"message\": \"Found " + count + " appointments. Check server console for details.\"}";
                }
            } catch (SQLException e) {
                String errorMsg = String.format(
                    "Error details:\n" +
                    "Message: %s\n" +
                    "SQL State: %s\n" +
                    "Error Code: %d",
                    e.getMessage(),
                    e.getSQLState(),
                    e.getErrorCode()
                );
                System.out.println(errorMsg);
                e.printStackTrace();
                return "{\"error\": \"" + e.getMessage() + "\"}";
            }
        });

        // Add this endpoint for healthcare professional dashboard
        get("/api/professional/dashboard", (req, res) -> {
            res.type("application/json");
            try {
                String slmcNo = req.queryParams("slmcNo");
                if (slmcNo == null || slmcNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "SLMC Number is required"));
                }

                HealthcareProfessionalDAO professionalDAO = new HealthcareProfessionalDAO(connHolder[0]);
                HealthcareProfessional professional = professionalDAO.getHealthcareProfessional(slmcNo);

                if (professional != null) {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("todayAppointments", getTodayAppointmentsCount(slmcNo));
                    stats.put("pendingReports", getPendingReportsCount(slmcNo));
                    stats.put("activePatients", getActivePatientsCount(slmcNo));

                    Map<String, Object> dashboardData = new HashMap<>();
                    dashboardData.put("professional", professional);
                    dashboardData.put("stats", stats);

                    return gson.toJson(dashboardData);
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Healthcare Professional not found"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Add these endpoints after the existing ones
        // Endpoint for requesting record access
        get("/api/professional/patient-lookup", (req, res) -> {
            res.type("application/json");
            String searchTerm = req.queryParams("search");
            
            try (Connection conn = getConnection()) {
                conn.setAutoCommit(true);
                
                String sql = "SELECT Personal_Health_No, Name, Date_of_Birth " +
                            "FROM Patient " +
                            "WHERE Personal_Health_No LIKE ? OR Name LIKE ?";
                
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    String searchPattern = "%" + searchTerm + "%";
                    pstmt.setString(1, searchPattern);
                    pstmt.setString(2, searchPattern);
                    
                    ResultSet rs = pstmt.executeQuery();
                    
                    if (rs.next()) {
                        Map<String, Object> patient = new HashMap<>();
                        patient.put("personalHealthNo", rs.getString("Personal_Health_No"));
                        patient.put("name", rs.getString("Name"));
                        patient.put("dateOfBirth", rs.getString("Date_of_Birth"));
                        return gson.toJson(patient);
                    } else {
                        res.status(404);
                        return gson.toJson(new ApiResponse("error", "Patient not found"));
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        post("/api/professional/request-access", (req, res) -> {
            res.type("application/json");
            try {
                String requestBody = req.body();
                System.out.println("Request body: " + requestBody);
                
                JsonObject jsonRequest = JsonParser.parseString(requestBody).getAsJsonObject();
                System.out.println("Parsed JSON request: " + jsonRequest);
                
                RecordAccess recordAccess = new RecordAccess();
                recordAccess.setPhn(jsonRequest.get("personalHealthNo").getAsString());
                recordAccess.setSlmcNo(jsonRequest.get("slmcNo").getAsString());
                recordAccess.setPurpose(jsonRequest.get("purpose").getAsString());
                recordAccess.setEmergency(jsonRequest.get("isEmergency").getAsBoolean());
                
                // Use the existing recordAccessDAO instance
                boolean success = recordAccessDAO.createAccessRequest(recordAccess);
                
                if (success) {
                    return gson.toJson(new ApiResponse("success", "Access request created successfully"));
                } else {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Failed to create access request"));
                }
                
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Update the records-data endpoint
        get("/api/professional/records-data", (req, res) -> {
            res.type("application/json");
            String slmcNo = req.queryParams("slmcNo");
            
            if (slmcNo == null || slmcNo.trim().isEmpty()) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "SLMC number is required"));
            }

            System.out.println("Fetching records for SLMC: " + slmcNo);
            
            try (Connection conn = getConnection()) {
                // Configure connection
                conn.setAutoCommit(false);
                conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
                
                // Disable statement cache
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("PRAGMA cache_size = 0");
                    stmt.execute("PRAGMA temp_store = MEMORY");
                }

                // Get records
                MedicalRecordDAO recordDAO = new MedicalRecordDAO(conn);
                List<MedicalRecord> medicalRecords = recordDAO.getRecordsByProfessional(slmcNo);
                System.out.println("Retrieved " + medicalRecords.size() + " medical records");

                // Get access records
                List<Map<String, Object>> accessedRecords = new ArrayList<>();
                if (recordAccessDAO != null) {
                    Map<String, List<Map<String, Object>>> accessData = recordAccessDAO.getRecordsData(slmcNo);
                    accessedRecords = accessData.get("accessedRecords");
                    System.out.println("Retrieved " + accessedRecords.size() + " access records");
                }

                // Commit transaction
                conn.commit();
                
                // Build response
                Map<String, Object> response = new HashMap<>();
                response.put("medicalRecords", medicalRecords);
                response.put("accessedRecords", accessedRecords);
                
                return gson.toJson(response);

            } catch (Exception e) {
                System.err.println("Error fetching professional records: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch records"));
            }
        });

        // Add these endpoints
        get("/api/professional/shared-records", (req, res) -> {
            res.type("application/json");
            String id = req.queryParams("slmcNo");
            String type = "PROFESSIONAL";
            
            try {
                List<RecordSharing> records = recordSharingDAO.getSharedRecords(id, type);
                return gson.toJson(records);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch shared records"));
            }
        });

        get("/api/institute/shared-records", (req, res) -> {
            res.type("application/json");
            String id = req.queryParams("instituteId");
            String type = "INSTITUTE";
            
            try {
                List<RecordSharing> records = recordSharingDAO.getSharedRecords(id, type);
                return gson.toJson(records);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch shared records"));
            }
        });

        get("/api/professional/record-requests", (req, res) -> {
            res.type("application/json");
            String userIdentifier = req.queryParams("userIdentifier");
            
            if (userIdentifier == null || userIdentifier.isEmpty()) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "User identifier is required"));
            }

            try {
                List<RecordRequest> requests = recordSharingDAO.getRecordRequests(userIdentifier, "PROFESSIONAL");
                return gson.toJson(requests);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch record requests"));
            }
        });

        get("/api/institute/record-requests", (req, res) -> {
            res.type("application/json");
            String id = req.queryParams("instituteId");
            String type = "INSTITUTE";
            
            try {
                List<RecordRequest> requests = recordSharingDAO.getRecordRequests(id, type);
                return gson.toJson(requests);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch record requests"));
            }
        });

        post("/api/professional/request-record", (req, res) -> {
            res.type("application/json");
            System.out.println("Received request body: " + req.body());
            
            try {
                JsonObject requestBody = JsonParser.parseString(req.body()).getAsJsonObject();
                
                // Validate required fields
                String[] requiredFields = {
                    "requestingSlmcNo", "providerName", "patientPHN", 
                    "recordType", "purpose", "receiverType"
                };
                
                // Check for missing fields
                for (String field : requiredFields) {
                    if (!requestBody.has(field) || requestBody.get(field) == null) {
                        res.status(400);
                        return gson.toJson(new ApiResponse("error", "Missing required field: " + field));
                    }
                }
                
                // Create a new record request with safe getters
                RecordRequest request = new RecordRequest();
                
                // Set the requester details
                request.setRequesterType("PROFESSIONAL");
                request.setRequesterSlmc(getStringFromJson(requestBody, "requestingSlmcNo"));
                
                // Set the receiver details based on receiver type
                String receiverType = getStringFromJson(requestBody, "receiverType");
                request.setReceiverType(receiverType);
                
                String providerName = getStringFromJson(requestBody, "providerName");
                if ("PROFESSIONAL".equals(receiverType)) {
                    request.setReceiverSlmc(providerName);
                } else {
                    request.setReceiverInstituteId(providerName);
                }
                
                // Set other request details
                request.setPatientPHN(getStringFromJson(requestBody, "patientPHN"));
                request.setRecordType(getStringFromJson(requestBody, "recordType"));
                request.setPurpose(getStringFromJson(requestBody, "purpose"));
                request.setStatus("pending");
                
                System.out.println("Created request object: " + request.toString());
                
                // Save the request using RecordSharingDAO
                RecordSharingDAO recordSharingDAO = new RecordSharingDAO(dataSource);
                boolean success = recordSharingDAO.createRecordRequest(request);
                
                if (success) {
                    return gson.toJson(new ApiResponse("success", "Record request submitted successfully"));
                } else {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Failed to submit record request"));
                }
                
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Error processing request: " + e.getMessage());
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        post("/api/institute/request-record", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                RecordRequest request = new RecordRequest();
                request.setRequesterInstituteId(jsonRequest.get("requestingInstituteId").getAsString());
                request.setRequesterType("INSTITUTE");
                request.setReceiverType(jsonRequest.has("receiverType") ? 
                    jsonRequest.get("receiverType").getAsString() : "PROFESSIONAL");
                request.setPatientPHN(jsonRequest.get("patientPHN").getAsString());
                request.setRecordType(jsonRequest.get("recordType").getAsString());
                request.setPurpose(jsonRequest.get("purpose").getAsString());
                
                if (request.getReceiverType().equals("PROFESSIONAL")) {
                    request.setReceiverSlmc(jsonRequest.get("providerName").getAsString());
                } else {
                    request.setReceiverInstituteId(jsonRequest.get("providerName").getAsString());
                }

                boolean success = recordSharingDAO.createRecordRequest(request);
                
                if (success) {
                    return gson.toJson(new ApiResponse("success", "Record request created successfully"));
                } else {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Failed to create record request"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        post("/api/professional/send-record", (req, res) -> {
            res.type("application/json");
            try {
                req.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));
                
                RecordSharing record = new RecordSharing();
                record.setSenderType("PROFESSIONAL");
                record.setSenderSlmc(req.raw().getParameter("senderSlmcNo"));
                record.setReceiverType(req.raw().getParameter("receiverType"));
                
                if (record.getReceiverType().equals("PROFESSIONAL")) {
                    record.setReceiverSlmc(req.raw().getParameter("providerName"));
                } else {
                    record.setReceiverInstituteId(req.raw().getParameter("providerName"));
                }
                
                record.setPatientPHN(req.raw().getParameter("patientPHN"));
                record.setRecordType(req.raw().getParameter("recordType"));
                record.setSubType(req.raw().getParameter("notes"));
                
                // Handle file upload
                Part filePart = req.raw().getPart("file");
                String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
                String filePath = UPLOAD_DIR + "/" + System.currentTimeMillis() + "_" + fileName;
                
                try (InputStream input = filePart.getInputStream()) {
                    Files.copy(input, Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);
                }
                
                record.setFilePath(filePath);
                record.setStatus("shared");
                
                boolean success = recordSharingDAO.shareRecord(record);
                
                if (success) {
                    return gson.toJson(new ApiResponse("success", "Record shared successfully"));
                } else {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Failed to share record"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        post("/api/institute/send-record", (req, res) -> {
            res.type("application/json");
            try {
                req.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));
                
                RecordSharing record = new RecordSharing();
                record.setSenderType("INSTITUTE");
                record.setSenderInstituteId(req.raw().getParameter("senderInstituteId"));
                record.setReceiverType(req.raw().getParameter("receiverType"));
                
                if (record.getReceiverType().equals("PROFESSIONAL")) {
                    record.setReceiverSlmc(req.raw().getParameter("providerName"));
                } else {
                    record.setReceiverInstituteId(req.raw().getParameter("providerName"));
                }
                
                record.setPatientPHN(req.raw().getParameter("patientPHN"));
                record.setRecordType(req.raw().getParameter("recordType"));
                record.setSubType(req.raw().getParameter("notes"));
                
                // Handle file upload
                Part filePart = req.raw().getPart("file");
                String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
                String filePath = UPLOAD_DIR + "/" + System.currentTimeMillis() + "_" + fileName;
                
                try (InputStream input = filePart.getInputStream()) {
                    Files.copy(input, Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);
                }
                
                record.setFilePath(filePath);
                record.setStatus("shared");
                
                boolean success = recordSharingDAO.shareRecord(record);
                
                if (success) {
                    return gson.toJson(new ApiResponse("success", "Record shared successfully"));
                } else {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Failed to share record"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Update your existing GET endpoint to format for FullCalendar
        // Add this endpoint for healthcare professional appointments
        get("/api/professional/appointments", (req, res) -> {
            res.type("application/json");
            String slmcNo = req.queryParams("slmcNo");
            System.out.println("Fetching appointments for SLMC: " + slmcNo);
            
            if (slmcNo == null || slmcNo.isEmpty()) {
                res.status(400);
                Map<String, String> error = new HashMap<>();
                error.put("error", "SLMC Number is required");
                return gson.toJson(error);
            }

            try {
                String sql = """
                    SELECT 
                        a.*,
                        p.Name as patient_name
                    FROM Appointment a
                    JOIN Patient p ON a.Personal_Health_No = p.Personal_Health_No
                    WHERE a.SLMC_No = ?
                    ORDER BY a.Appointment_Date DESC, a.Appointment_Time DESC
                """;
                
                List<Map<String, Object>> appointments = new ArrayList<>();
                
                try (Connection conn = getConnection();
                    PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    
                    pstmt.setString(1, slmcNo);
                    ResultSet rs = pstmt.executeQuery();
                    
                    while (rs.next()) {
                        Map<String, Object> appointment = new HashMap<>();
                        appointment.put("id", rs.getInt("Appointment_ID"));
                        appointment.put("patientPHN", rs.getString("Personal_Health_No"));
                        appointment.put("patientName", rs.getString("patient_name"));
                        appointment.put("appointmentDate", rs.getDate("Appointment_Date").toString());
                        appointment.put("appointmentTime", rs.getTime("Appointment_Time").toString());
                        appointment.put("purpose", rs.getString("Purpose"));
                        appointment.put("status", rs.getString("Status"));
                        appointment.put("notes", rs.getString("Notes"));
                        appointment.put("healthInstituteNumber", rs.getString("Health_Institute_Number"));
                        
                        appointments.add(appointment);
                    }
                }
                
                System.out.println("Found " + appointments.size() + " appointments");
                return gson.toJson(appointments);
                
            } catch (SQLException e) {
                System.err.println("Database error: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to fetch appointments: " + e.getMessage());
                return gson.toJson(error);
            }
        });

        get("/api/professional/appointment-requests", (req, res) -> {
            res.type("application/json");
            String slmcNo = req.queryParams("slmcNo");
            
            try {
                if (slmcNo == null || slmcNo.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "SLMC number is required"));
                }

                AppointmentDAO appointmentDAO = new AppointmentDAO();
                Vector<Appointment> requests = appointmentDAO.getPendingAppointments(slmcNo);
                return gson.toJson(requests);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch appointment requests"));
            }
        });

        post("/api/professional/appointments", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                // Validate required fields
                String[] requiredFields = {"patientPHN", "slmcNo", "appointmentDate", "appointmentTime", "purpose"};
                for (String field : requiredFields) {
                    if (!jsonRequest.has(field) || jsonRequest.get(field).getAsString().trim().isEmpty()) {
                        res.status(400);
                        return gson.toJson(new ApiResponse("error", "Missing required field: " + field));
                    }
                }

                Appointment appointment = new Appointment();
                appointment.setPersonalHealthNo(jsonRequest.get("patientPHN").getAsString());
                appointment.setSlmcNo(jsonRequest.get("slmcNo").getAsString());
                
                // Parse date and time
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
                
                java.util.Date parsedDate = dateFormat.parse(jsonRequest.get("appointmentDate").getAsString());  // Removed extra parenthesis
                java.util.Date parsedTime = timeFormat.parse(jsonRequest.get("appointmentTime").getAsString());  // Removed extra parenthesis
                
                appointment.setAppointmentDate(new java.sql.Date(parsedDate.getTime()));
                appointment.setAppointmentTime(new java.sql.Time(parsedTime.getTime()));
                
                appointment.setPurpose(jsonRequest.get("purpose").getAsString());
                appointment.setStatus("Scheduled"); // Professional-created appointments are automatically scheduled
                appointment.setNotes(
                    jsonRequest.has("notes") ? 
                    jsonRequest.get("notes").getAsString() : ""
                );
                appointment.setHealthInstituteNumber(
                    jsonRequest.has("healthInstituteNumber") ? 
                    jsonRequest.get("healthInstituteNumber").getAsString() : ""
                );

                AppointmentDAO appointmentDAO = new AppointmentDAO();
                appointmentDAO.insertAppointment(appointment);
                
                return gson.toJson(new ApiResponse("success", "Appointment created successfully"));
            } catch (ParseException e) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Invalid date format: " + e.getMessage()));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to create appointment: " + e.getMessage()));
            }
        });

        put("/api/professional/appointments/:id", (req, res) -> {
            res.type("application/json");
            try {
                int appointmentId = Integer.parseInt(req.params(":id"));
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                Appointment appointment = appointmentDAO.getAppointmentById(appointmentId);
                
                if (appointment == null) {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Appointment not found"));
                }
                
                // Update fields if provided
                if (jsonRequest.has("appointmentDate")) {
                    appointment.setAppointmentDate(java.sql.Date.valueOf(jsonRequest.get("appointmentDate").getAsString()));
                }
                if (jsonRequest.has("appointmentTime")) {
                    appointment.setAppointmentTime(java.sql.Time.valueOf(jsonRequest.get("appointmentTime").getAsString() + ":00"));
                }
                if (jsonRequest.has("purpose")) {
                    appointment.setPurpose(jsonRequest.get("purpose").getAsString());
                }
                if (jsonRequest.has("status")) {
                    appointment.setStatus(jsonRequest.get("status").getAsString());
                }
                if (jsonRequest.has("notes")) {
                    appointment.setNotes(jsonRequest.get("notes").getAsString());
                }
                
                appointmentDAO.updateAppointment(appointment);
                
                return gson.toJson(new ApiResponse("success", "Appointment updated successfully"));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to update appointment: " + e.getMessage()));
            }
        });

        put("/api/professional/appointment-requests/:id/status", (req, res) -> {
            res.type("application/json");
            try {
                int appointmentId = Integer.parseInt(req.params(":id"));
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                String status = jsonRequest.get("status").getAsString();
                
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                Appointment appointment = appointmentDAO.getAppointmentById(appointmentId);
                
                if (appointment != null) {
                    appointment.setStatus(status);
                    appointmentDAO.updateAppointment(appointment);
                    return gson.toJson(new ApiResponse("success", "Appointment status updated successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Appointment not found"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to update appointment status: " + e.getMessage()));
            }
        });

        // Add these endpoints after your existing routes
        get("/api/institute/dashboard", (req, res) -> {
            res.type("application/json");
            Connection conn = null;
            try {
                String instituteNumber = req.queryParams("instituteNumber");
                if (instituteNumber == null || instituteNumber.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Institute Number is required"));
                }

                conn = getConnection();
                Map<String, Object> dashboardData = new HashMap<>();

                // Get basic institute info
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT * FROM Healthcare_Institute WHERE Health_Institute_Number = ?")) {
                    pstmt.setString(1, instituteNumber);
                    ResultSet rs = pstmt.executeQuery();
                    if (rs.next()) {
                        Map<String, Object> institute = new HashMap<>();
                        institute.put("instituteNumber", rs.getString("Health_Institute_Number")); // Add this line
                        institute.put("name", rs.getString("Name"));
                        institute.put("type", rs.getString("Type"));
                        dashboardData.put("institute", institute);
                    } else {
                        res.status(404);
                        return gson.toJson(new ApiResponse("error", "Institute not found"));
                    }
                }

                // Get counts directly with simple queries
                Map<String, Object> stats = new HashMap<>();
                
                // Count professionals
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT COUNT(*) FROM Healthcare_Professional WHERE Health_Institute_Number = ?")) {
                    pstmt.setString(1, instituteNumber);
                    ResultSet rs = pstmt.executeQuery();
                    stats.put("activeProfessionals", rs.next() ? rs.getInt(1) : 0);
                }

                // Count today's appointments
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT COUNT(*) FROM Appointment WHERE Health_Institute_Number = ? AND Appointment_Date = DATE('now')")) {
                    pstmt.setString(1, instituteNumber);
                    ResultSet rs = pstmt.executeQuery();
                    stats.put("todayAppointments", rs.next() ? rs.getInt(1) : 0);
                }

                // Count medical records
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT COUNT(*) FROM Medical_Record WHERE Health_Institute_Number = ?")) {
                    pstmt.setString(1, instituteNumber);
                    ResultSet rs = pstmt.executeQuery();
                    stats.put("pendingReports", rs.next() ? rs.getInt(1) : 0);
                }

                dashboardData.put("stats", stats);
                return gson.toJson(dashboardData);

            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", e.getMessage()));
            } finally {
                if (conn != null) {
                    try {
                        conn.close();
                    } catch (SQLException e) {
                        System.err.println("Error closing connection: " + e.getMessage());
                    }
                }
            }
        });

        // Get institute professionals
        get("/api/institute/professionals", (req, res) -> {
            res.type("application/json");
            String instituteNumber = req.queryParams("instituteNumber");
            
            try {
                if (instituteNumber == null || instituteNumber.isEmpty()) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Institute number is required"));
                }

                InstituteStaffDAO staffDAO = new InstituteStaffDAO();
                List<Map<String, Object>> professionals = staffDAO.getInstituteProfessionals(instituteNumber);
                return gson.toJson(professionals);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch professionals"));
            }
        });

        // Add professional to institute
        post("/api/institute/professionals", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                String instituteNumber = jsonRequest.get("instituteNumber").getAsString();
                String slmcNo = jsonRequest.get("slmcNo").getAsString();

                InstituteStaffDAO staffDAO = new InstituteStaffDAO();
                boolean success = staffDAO.addProfessional(instituteNumber, slmcNo);

                if (success) {
                    return gson.toJson(new ApiResponse("success", "Professional added successfully"));
                } else {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Professional not found or already associated"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Update professional status
        put("/api/institute/professionals/:slmcNo", (req, res) -> {
            res.type("application/json");
            try {
                String slmcNo = req.params(":slmcNo");
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                String instituteNumber = jsonRequest.get("instituteNumber").getAsString();
                String status = jsonRequest.get("status").getAsString();

                InstituteStaffDAO staffDAO = new InstituteStaffDAO();
                boolean success = staffDAO.updateProfessionalStatus(instituteNumber, slmcNo, status);

                if (success) {
                    return gson.toJson(new ApiResponse("success", "Professional status updated"));
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Professional not found"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Get professional details by SLMC number
        get("/api/professional/details/:slmcNo", (req, res) -> {
            res.type("application/json");
            String slmcNo = req.params(":slmcNo");
            
            try {
                String sql = "SELECT SLMC_No, Name, Specialty, Role FROM Healthcare_Professional WHERE SLMC_No = ?";
                try (Connection conn = getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    
                    pstmt.setString(1, slmcNo);
                    ResultSet rs = pstmt.executeQuery();
                    
                    if (rs.next()) {
                        Map<String, Object> professional = new HashMap<>();
                        professional.put("slmcNo", rs.getString("SLMC_No"));
                        professional.put("name", rs.getString("Name"));
                        professional.put("specialty", rs.getString("Specialty"));
                        professional.put("role", rs.getString("Role"));
                        return gson.toJson(professional);
                    } else {
                        res.status(404);
                        return gson.toJson(new ApiResponse("error", "Professional not found"));
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Update the institute medical records endpoint
        get("/api/institute/medical-records/:phn", (req, res) -> {
            res.type("application/json");
            String phn = req.params(":phn");
            System.out.println("Institute endpoint - Fetching records for PHN: " + phn);

            try {
                // Use the same query as professional endpoint
                String sql = """
                    SELECT r.*, p.Name as Patient_Name 
                    FROM Medical_Record r 
                    LEFT JOIN Patient p ON r.Personal_Health_No = p.Personal_Health_No 
                    WHERE r.Personal_Health_No = ?
                    ORDER BY r.Date DESC
                """;

                try (Connection conn = dataSource.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    
                    pstmt.setString(1, phn);
                    ResultSet rs = pstmt.executeQuery();
                    
                    List<Map<String, Object>> records = new ArrayList<>();
                    while (rs.next()) {
                        Map<String, Object> record = new HashMap<>();
                        record.put("recordId", rs.getInt("Record_ID"));
                        record.put("dateOfVisit", rs.getString("Date"));
                        record.put("type", rs.getString("Type"));
                        record.put("diagnosis", rs.getString("Diagnosis"));
                        record.put("medications", rs.getString("Medications")); // Changed from Prescription
                        record.put("notes", rs.getString("Notes"));
                        record.put("patientName", rs.getString("Patient_Name"));
                        records.add(record);
                    }
                    
                    System.out.println("Retrieved " + records.size() + " records for PHN: " + phn);
                    return gson.toJson(records);
                }
            } catch (Exception e) {
                System.err.println("Error fetching medical records: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch medical records"));
            }
        });

        // Add this endpoint for downloading records
        get("/api/institute/medical-records/download/:recordId", (req, res) -> {
            String recordId = req.params(":recordId");
            // Implement file download logic here
            // This will depend on how you're storing files in your system
            return "File download implementation needed";
        });

        // Add this endpoint for institute records data
        get("/api/institute/records-data", (req, res) -> {
            res.type("application/json");
            String instituteId = req.queryParams("instituteId");
            System.out.println("Received records-data request for Institute: " + instituteId);

            try {
                RecordAccessDAO accessDAO = new RecordAccessDAO(dataSource);
                Map<String, List<Map<String, Object>>> response = accessDAO.getInstituteRecordsData(instituteId);
                System.out.println("Fetched " + response.get("accessedRecords").size() + " accessed records for institute " + instituteId);
                return gson.toJson(response);
            } catch (Exception e) {
                System.err.println("Error fetching institute records: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch records"));
            }
        });

        // Add patient lookup endpoint
        get("/api/institute/patient-lookup", (req, res) -> {
            res.type("application/json");
            String searchTerm = req.queryParams("search");
            
            if (searchTerm == null || searchTerm.isEmpty()) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Search term is required"));
            }

            try (Connection conn = getConnection()) {
                String sql = "SELECT Personal_Health_No, Name FROM PATIENT WHERE Personal_Health_No = ?";
                
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, searchTerm);
                    ResultSet rs = pstmt.executeQuery();
                    
                    if (rs.next()) {
                        Map<String, String> patient = new HashMap<>();
                        patient.put("personalHealthNo", rs.getString("Personal_Health_No"));
                        patient.put("name", rs.getString("Name"));
                        return gson.toJson(patient);
                    } else {
                        res.status(404);
                        return gson.toJson(new ApiResponse("error", "Patient not found"));
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        // Add request access endpoint for institutes
        post("/api/institute/request-access", (req, res) -> {
            res.type("application/json");
            try {
                String requestBody = req.body();
                System.out.println("Request body: " + requestBody);
                
                JsonObject jsonRequest = JsonParser.parseString(requestBody).getAsJsonObject();
                System.out.println("Parsed JSON request: " + jsonRequest);
                
                RecordAccess recordAccess = new RecordAccess();
                recordAccess.setPhn(jsonRequest.get("personalHealthNo").getAsString());
                recordAccess.setInstituteNo(jsonRequest.get("instituteNo").getAsString());
                recordAccess.setPurpose(jsonRequest.get("purpose").getAsString());
                recordAccess.setEmergency(jsonRequest.get("isEmergency").getAsBoolean());
                
                boolean success = recordAccessDAO.createAccessRequest(recordAccess);
                
                if (success) {
                    return gson.toJson(new ApiResponse("success", "Access request created successfully"));
                } else {
                    res.status(500);
                    return gson.toJson(new ApiResponse("error", "Failed to create access request"));
                }
                
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Add shared records endpoint for institutes
        get("/api/institute/shared-records", (req, res) -> {
            res.type("application/json");
            String instituteId = req.queryParams("instituteId");
            
            if (instituteId == null || instituteId.isEmpty()) {
                res.status(400);
                return gson.toJson(new ApiResponse("error", "Institute ID is required"));
            }

            try (Connection conn = getConnection()) {
                String sql = 
                    "SELECT sr.*, mr.*, p.Name as patientName " +
                    "FROM Shared_Records sr " +
                    "JOIN Medical_Record mr ON sr.record_id = mr.Record_ID " +
                    "JOIN PATIENT p ON mr.Personal_Health_No = p.Personal_Health_No " +
                    "WHERE sr.receiver_institute_id = ? " +
                    "AND sr.receiver_type = 'INSTITUTE' " +
                    "ORDER BY sr.share_date DESC";

                List<Map<String, Object>> sharedRecords = new ArrayList<>();
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, instituteId);
                    ResultSet rs = pstmt.executeQuery();
                    
                    while (rs.next()) {
                        Map<String, Object> record = new HashMap<>();
                        record.put("recordId", rs.getInt("record_id"));
                        record.put("personalHealthNo", rs.getString("Personal_Health_No"));
                        record.put("patientName", rs.getString("patientName"));
                        record.put("type", rs.getString("record_type"));
                        record.put("dateOfVisit", rs.getString("Date_of_Visit"));
                        record.put("diagnosis", rs.getString("Diagnosis"));
                        record.put("treatment", rs.getString("Treatment"));
                        record.put("notes", rs.getString("Notes"));
                        record.put("shareDate", rs.getTimestamp("share_date").toString());
                        record.put("status", rs.getString("status"));
                        sharedRecords.add(record);
                    }
                }
                
                return gson.toJson(sharedRecords);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch shared records: " + e.getMessage()));
            }
        });

        // Add these appointment endpoints after your existing routes
        get("/api/institute/appointments", (req, res) -> {
            res.type("application/json");
            String instituteId = req.queryParams("instituteId");
            String status = req.queryParams("status");
            String search = req.queryParams("search");
            
            System.out.println("Fetching appointments for institute: " + instituteId);
            
            try {
                Map<String, Object> response = new HashMap<>();
                AppointmentDAO appointmentDAO = new AppointmentDAO();

                // Get appointments with joined data
                String sql = """
                    SELECT 
                        a.*,
                        p.Name as patient_name,
                        hp.Name as professional_name,
                        a.Appointment_Date,
                        a.Appointment_Time,
                        datetime(a.Appointment_Date || ' ' || a.Appointment_Time) as appointment_datetime
                    FROM Appointment a
                    JOIN Patient p ON a.Personal_Health_No = p.Personal_Health_No
                    JOIN Healthcare_Professional hp ON a.SLMC_No = hp.SLMC_No
                    WHERE a.Health_Institute_Number = ?
                """;

                if (status != null && !status.equals("all")) {
                    sql += " AND a.Status = ?";
                }
                if (search != null && !search.isEmpty()) {
                    sql += " AND (p.Name LIKE ? OR hp.Name LIKE ? OR a.Purpose LIKE ?)";
                }
                sql += " ORDER BY a.Appointment_Date DESC, a.Appointment_Time DESC";

                List<Map<String, Object>> appointments = new ArrayList<>();
                try (PreparedStatement pstmt = connHolder[0].prepareStatement(sql)) {
                    int paramIndex = 1;
                    pstmt.setString(paramIndex++, instituteId);
                    
                    if (status != null && !status.equals("all")) {
                        pstmt.setString(paramIndex++, status);
                    }
                    if (search != null && !search.isEmpty()) {
                        String searchPattern = "%" + search + "%";
                        pstmt.setString(paramIndex++, searchPattern);
                        pstmt.setString(paramIndex++, searchPattern);
                        pstmt.setString(paramIndex++, searchPattern);
                    }

                    ResultSet rs = pstmt.executeQuery();
                    while (rs.next()) {
                        Map<String, Object> appointment = new HashMap<>();
                        appointment.put("id", rs.getInt("Appointment_ID"));
                        appointment.put("patientPHN", rs.getString("Personal_Health_No"));
                        appointment.put("patientName", rs.getString("patient_name"));
                        appointment.put("professionalId", rs.getString("SLMC_No"));
                        appointment.put("professionalName", rs.getString("professional_name"));
                        appointment.put("purpose", rs.getString("Purpose"));
                        appointment.put("status", rs.getString("Status"));
                        
                        // Format the date and time properly
                        java.sql.Date appointmentDate = rs.getDate("Appointment_Date");
                        java.sql.Time appointmentTime = rs.getTime("Appointment_Time");
                        
                        if (appointmentDate != null && appointmentTime != null) {
                            // Format as ISO string
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                            java.util.Date combinedDate = new java.util.Date(
                                appointmentDate.getTime() + appointmentTime.getTime() % (24*60*60*1000)
                            );
                            appointment.put("dateTime", sdf.format(combinedDate));
                        }
                        
                        appointments.add(appointment);
                        System.out.println("Appointment datetime: " + appointment.get("dateTime"));
                    }
                }

                response.put("appointments", appointments);
                response.put("todayCount", appointmentDAO.getTodayAppointmentsCount(instituteId));
                
                return gson.toJson(response);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch appointments: " + e.getMessage()));
            }
        });

        post("/api/institute/appointments", (req, res) -> {
        res.type("application/json");
        try {
            JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
            System.out.println("Received appointment request: " + jsonRequest);

            // Create new appointment
            Appointment appointment = new Appointment();
            appointment.setHealthInstituteNumber(jsonRequest.get("instituteId").getAsString());
            appointment.setPersonalHealthNo(jsonRequest.get("patientPHN").getAsString());
            appointment.setSlmcNo(jsonRequest.get("professionalId").getAsString());
            appointment.setPurpose(jsonRequest.get("purpose").getAsString());
            
            // Format the datetime string properly
            String dateTimeStr = jsonRequest.get("dateTime").getAsString() + ":00";  // Add seconds
            Timestamp appointmentDateTime = Timestamp.valueOf(dateTimeStr);
            
            appointment.setAppointmentDate(new java.sql.Date(appointmentDateTime.getTime()));
            appointment.setAppointmentTime(new java.sql.Time(appointmentDateTime.getTime()));
            
            appointment.setStatus("scheduled");
            
            AppointmentDAO appointmentDAO = new AppointmentDAO();
            appointmentDAO.insertAppointment(appointment);
            
            return gson.toJson(new ApiResponse("success", "Appointment created successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to create appointment: " + e.getMessage()));
            }
        });

        put("/api/institute/appointments/:id", (req, res) -> {
            res.type("application/json");
            try {
                int appointmentId = Integer.parseInt(req.params(":id"));
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                Appointment appointment = appointmentDAO.getAppointmentById(appointmentId);
                
                if (appointment == null) {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Appointment not found"));
                }
                
                // Update fields if provided
                if (jsonRequest.has("status")) {
                    appointment.setStatus(jsonRequest.get("status").getAsString());
                }
                if (jsonRequest.has("dateTime")) {
                    String[] dateTimeParts = jsonRequest.get("dateTime").getAsString().split("T");
                    appointment.setAppointmentDate(java.sql.Date.valueOf(dateTimeParts[0]));
                    String timeStr = dateTimeParts[1].split("\\.")[0];
                    appointment.setAppointmentTime(java.sql.Time.valueOf(timeStr));
                }
                if (jsonRequest.has("purpose")) {
                    appointment.setPurpose(jsonRequest.get("purpose").getAsString());
                }
                
                appointmentDAO.updateAppointment(appointment);
                return gson.toJson(new ApiResponse("success", "Appointment updated successfully"));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to update appointment: " + e.getMessage()));
            }
        });

        delete("/api/institute/appointments/:id", (req, res) -> {
            res.type("application/json");
            try {
                int appointmentId = Integer.parseInt(req.params(":id"));
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                appointmentDAO.deleteAppointment(appointmentId);
                return gson.toJson(new ApiResponse("success", "Appointment deleted successfully"));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to delete appointment: " + e.getMessage()));
            }
        });

        get("/api/institute/dashboard-stats", (req, res) -> {
            res.type("application/json");
            try {
                String instituteId = req.queryParams("instituteId");
                System.out.println("Fetching dashboard stats for institute: " + instituteId);
                
                Map<String, Object> stats = new HashMap<>();

                // Modified SQL to handle timestamp format
                String countSql = """
                    SELECT COUNT(*) as count 
                    FROM Appointment 
                    WHERE Health_Institute_Number = ? 
                    AND datetime(Appointment_Date/1000, 'unixepoch') LIKE '2024-11-12%'
                    AND Status != 'cancelled'
                """;

                try (Connection conn = getConnection();
                     PreparedStatement countStmt = conn.prepareStatement(countSql)) {
                    countStmt.setString(1, instituteId);
                    ResultSet countRs = countStmt.executeQuery();
                    int count = countRs.next() ? countRs.getInt("count") : 0;
                    stats.put("todayCount", count);
                    System.out.println("Today's appointment count for institute " + instituteId + ": " + count);
                    
                    // Debug query
                    String debugSql = """
                        SELECT 
                            Appointment_Date,
                            datetime(Appointment_Date/1000, 'unixepoch') as formatted_date
                        FROM Appointment 
                        WHERE Health_Institute_Number = ?
                    """;
                    try (PreparedStatement debugStmt = conn.prepareStatement(debugSql)) {
                        debugStmt.setString(1, instituteId);
                        ResultSet debugRs = debugStmt.executeQuery();
                        while (debugRs.next()) {
                            System.out.println("Raw date: " + debugRs.getString("Appointment_Date") + 
                                             " Formatted: " + debugRs.getString("formatted_date"));
                        }
                    }
                }

                return gson.toJson(stats);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch dashboard stats: " + e.getMessage()));
            }
        });

        // Add this endpoint after other patient-related endpoints
        put("/api/patient/profile/:phn", (req, res) -> {
            res.type("application/json");
            String phn = req.params(":phn");
            
            try {
                JsonObject jsonRequest = JsonParser.parseString(req.body()).getAsJsonObject();
                Patient patient = new Patient();
                
                // Map JSON request to Patient object
                patient.setPersonalHealthNo(phn);
                patient.setAddress(getStringFromJson(jsonRequest, "address"));
                patient.setEmail(getStringFromJson(jsonRequest, "email"));
                patient.setPhoneNumber(getStringFromJson(jsonRequest, "contactNo"));
                patient.setEmergencyContactName(getStringFromJson(jsonRequest, "emergencyContact"));
                patient.setEmergencyContactPhone(getStringFromJson(jsonRequest, "emergencyPhone"));
                patient.setBloodType(getStringFromJson(jsonRequest, "bloodType"));
                patient.setMedicalConditions(getStringFromJson(jsonRequest, "medicalConditions"));

                // Handle numeric fields
                try {
                    String heightStr = getStringFromJson(jsonRequest, "height");
                    String weightStr = getStringFromJson(jsonRequest, "weight");
                    if (heightStr != null) patient.setHeight(Float.parseFloat(heightStr));
                    if (weightStr != null) patient.setWeight(Float.parseFloat(weightStr));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(new ApiResponse("error", "Invalid number format for height or weight"));
                }

                PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                boolean updated = patientDAO.updatePatientProfile(patient);
                
                if (updated) {
                    return gson.toJson(new ApiResponse("success", "Profile updated successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(new ApiResponse("error", "Failed to update profile"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Server error: " + e.getMessage()));
            }
        });

        // Add this endpoint for deleting appointments
        delete("/api/professional/appointments/:id", (req, res) -> {
            res.type("application/json");
            String appointmentId = req.params(":id");
            String slmcNo = req.queryParams("slmcNo");
            
            try {
                if (appointmentId == null || appointmentId.isEmpty()) {
                    res.status(400);
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Appointment ID is required");
                    return gson.toJson(error);
                }

                String sql = "DELETE FROM Appointment WHERE Appointment_ID = ?";
                
                try (Connection conn = getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    
                    pstmt.setInt(1, Integer.parseInt(appointmentId));
                    int affectedRows = pstmt.executeUpdate();
                    
                    if (affectedRows > 0) {
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Appointment deleted successfully");
                        return gson.toJson(response);
                    } else {
                        res.status(404);
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Appointment not found");
                        return gson.toJson(error);
                    }
                }
            } catch (SQLException e) {
                System.err.println("Database error: " + e.getMessage());
                e.printStackTrace();
                res.status(500);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to delete appointment: " + e.getMessage());
                return gson.toJson(error);
            } catch (NumberFormatException e) {
                res.status(400);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid appointment ID format");
                return gson.toJson(error);
            }
        });

        // endpoint for healthcare professionals to add medical records
        post("/api/professional/medical-records", (req, res) -> {
            res.type("application/json");
            Connection conn = null;
            
            try {
                // Get request body and parse it
                String requestBody = req.body();
                System.out.println("Received medical record data: " + requestBody);
                
                // Create a custom Gson instance that ignores the recordId field
                Gson customGson = new GsonBuilder()
                    .setDateFormat("yyyy-MM-dd")
                    .create();
                
                MedicalRecord record = customGson.fromJson(requestBody, MedicalRecord.class);
                
                // Get a fresh connection
                conn = getConnection();
                conn.setAutoCommit(false);
                
                // Create DAO and insert record
                MedicalRecordDAO recordDAO = new MedicalRecordDAO(conn);
                recordDAO.insertMedicalRecord(record);
                
                // Commit the transaction
                conn.commit();
                
                // Return success response with the new record ID
                return gson.toJson(new ApiResponse("success", "Record added successfully"));
                
            } catch (Exception e) {
                if (conn != null) {
                    try {
                        conn.rollback();
                    } catch (SQLException ex) {
                        ex.printStackTrace();
                    }
                }
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to add record: " + e.getMessage()));
            } finally {
                if (conn != null) {
                    try {
                        conn.close();
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
            }
        });

        // Add a debug endpoint to check records
        get("/api/debug/check-records/:phn", (req, res) -> {
            res.type("application/json");
            String phn = req.params(":phn");
            
            try (Connection conn = getConnection()) {
                String sql = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, phn);
                    ResultSet rs = pstmt.executeQuery();
                    
                    System.out.println("\nChecking records for PHN: " + phn);
                    while (rs.next()) {
                        System.out.println("Record ID: " + rs.getInt("Record_ID"));
                        System.out.println("Summary: " + rs.getString("Summary"));
                        System.out.println("Date: " + rs.getDate("Date_of_Visit"));
                        System.out.println("Type: " + rs.getString("Type"));
                        System.out.println("--------------------");
                    }
                }
                return gson.toJson(
                    new ApiResponse("success", "Records checked - see server console"));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to check records: " + e.getMessage()));
            }
        });

        // After database initialization
        initializeDataSource();
        
        try (Connection conn = getConnection()) {
            // Create indexes
            createIndexes(conn);
            
            // Optimize database
            try (Statement stmt = conn.createStatement()) {
                // Enable memory-mapped I/O
                stmt.execute("PRAGMA mmap_size = 30000000000");
                
                // Set page size for better performance
                stmt.execute("PRAGMA page_size = 4096");
                
                // Enable Write-Ahead Logging
                stmt.execute("PRAGMA journal_mode = WAL");
                
                // Set cache size (in pages)
                stmt.execute("PRAGMA cache_size = -2000");
                
                // Set synchronous mode
                stmt.execute("PRAGMA synchronous = NORMAL");
                
                // Store temp tables and indices in memory
                stmt.execute("PRAGMA temp_store = MEMORY");
                
                // Analyze the database for query optimization
                stmt.execute("ANALYZE");
            }
            
        } catch (SQLException e) {
            System.err.println("Error optimizing database: " + e.getMessage());
            e.printStackTrace();
        }

        // Update the analytics endpoint
        get("/api/professional/analytics", (req, res) -> {
            res.type("application/json");
            String slmcNo = req.queryParams("slmcNo");
            String timeRange = req.queryParams("range");
            int months = timeRange != null ? Integer.parseInt(timeRange.replace("m", "")) : 12;
            
            try {
                AnalyticsDAO analyticsDAO = new AnalyticsDAO();
                Map<String, Object> analytics = analyticsDAO.getAnalytics(slmcNo, months);
                return gson.toJson(analytics);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to generate analytics: " + e.getMessage()));
            }
        });

        // the endpoint path changed to be more specific
        get("/api/patient/dashboard/summary/:phn", (req, res) -> {
            String personalHealthNo = req.params(":phn");
            Map<String, Object> dashboardData = new HashMap<>();
            
            try {
                // Get patient details first
                PatientDAO patientDAO = new PatientDAO(connHolder[0]);
                Patient patient = patientDAO.getPatient(personalHealthNo);
                dashboardData.put("patient", patient);  // Added this line
                
                // Get recent medical records (limited to 3)
                MedicalRecordDAO medicalRecordDAO = new MedicalRecordDAO(connHolder[0]);
                List<MedicalRecord> recentRecords = medicalRecordDAO.getRecentRecords(personalHealthNo, 3);
                
                // Get upcoming appointments (limited to 3)
                AppointmentDAO appointmentDAO = new AppointmentDAO();
                Vector<Appointment> upcomingAppointments = appointmentDAO.getUpcomingAppointmentsForPatient(personalHealthNo);
                
                // Format the records to match frontend expectations
                List<Map<String, Object>> formattedRecords = recentRecords.stream()
                    .map(record -> {
                        Map<String, Object> formatted = new HashMap<>();
                        formatted.put("type", record.getType());
                        formatted.put("date", record.getDateOfVisit().toString());
                        formatted.put("description", record.getSummary());
                        return formatted;
                    })
                    .collect(Collectors.toList());
                
                // Format the appointments to match frontend expectations
                List<Map<String, Object>> formattedAppointments = upcomingAppointments.stream()
                    .limit(3)
                    .map(appointment -> {
                        Map<String, Object> formatted = new HashMap<>();
                        formatted.put("purpose", appointment.getPurpose());
                        formatted.put("date", appointment.getAppointmentDate().toString());
                        formatted.put("time", appointment.getAppointmentTime().toString());
                        formatted.put("status", appointment.getStatus().toLowerCase());  // Ensure status is lowercase
                        return formatted;
                    })
                    .collect(Collectors.toList());
                
                dashboardData.put("recentRecords", formattedRecords);
                dashboardData.put("upcomingAppointments", formattedAppointments);
                
                return gson.toJson(dashboardData);
                
            } catch (SQLException e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Database error: " + e.getMessage()));
            }
        });

        // endpoint for institute analytics
        get("/api/institute/analytics", (req, res) -> {
            res.type("application/json");
            String instituteId = req.queryParams("instituteId");
            int days = Integer.parseInt(req.queryParams("days"));
            
            try {
                AnalyticsDAO analyticsDAO = new AnalyticsDAO();
                Map<String, Object> analytics = analyticsDAO.getInstituteAnalytics(instituteId, days);
                return gson.toJson(analytics);
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(new ApiResponse("error", "Failed to fetch institute analytics: " + e.getMessage()));
            }
        });
    }

    private static void createIndexes(Connection conn) throws SQLException {
        String[] indexes = {
            "CREATE INDEX IF NOT EXISTS idx_medical_record_phn ON Medical_Record(Personal_Health_No)",
            "CREATE INDEX IF NOT EXISTS idx_medical_record_slmc ON Medical_Record(SLMC_No)",
            "CREATE INDEX IF NOT EXISTS idx_medical_record_date ON Medical_Record(Date_of_Visit)",
            "CREATE INDEX IF NOT EXISTS idx_appointment_phn ON Appointment(Personal_Health_No)",
            "CREATE INDEX IF NOT EXISTS idx_appointment_date ON Appointment(Appointment_Date)",
            "CREATE INDEX IF NOT EXISTS idx_record_access_phn ON Record_Access_Requests(Personal_Health_No)",
            "CREATE INDEX IF NOT EXISTS idx_record_access_slmc ON Record_Access_Requests(SLMC_No)"
        };
        
        try (Statement stmt = conn.createStatement()) {
            for (String index : indexes) {
                stmt.execute(index);
            }
        }
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


    // Add these methods after the main method in Main.java

    private static int getTodayAppointmentsCount(String slmcNo) {
        String sql = "SELECT COUNT(*) as count FROM Appointment " +
                     "WHERE SLMC_No = ? AND Appointment_Date = DATE('now') " +
                     "AND Status != 'cancelled'";
        
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt("count");
            }
        } catch (SQLException e) {
            System.out.println("Error getting today's appointments count: " + e.getMessage());
        }
        return 0;
    }

    private static int getPendingReportsCount(String slmcNo) {
        String sql = "SELECT COUNT(*) as count FROM Record_Access_Requests " +
                     "WHERE SLMC_No = ? AND Status = 'pending'";
        
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt("count");
            }
        } catch (SQLException e) {
            System.out.println("Error getting pending reports count: " + e.getMessage());
        }
        return 0;
    }

    private static int getActivePatientsCount(String slmcNo) {
        // This will count unique patients with appointments in the last 30 days
        String sql = "SELECT COUNT(DISTINCT Personal_Health_No) as count " +
                     "FROM Appointment " +
                     "WHERE SLMC_No = ? " +
                     "AND Appointment_Date >= date('now', '-30 days') " +
                     "AND Status != 'cancelled'";
        
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt("count");
            }
        } catch (SQLException e) {
            System.out.println("Error getting active patients count: " + e.getMessage());
        }
        return 0;
    }

    
    private static String generateSecret() {
        // Generate a random string of 6 digits
        Random random = new Random();
        int number = random.nextInt(999999);
        // Format the number to ensure it's 6 digits with leading zeros if needed
        return String.format("%06d", number);
    }

    // Add this method to Main class
    public static HikariDataSource getDataSource() {
        if (dataSource == null) {
            throw new IllegalStateException("DataSource has not been initialized");
        }
        return dataSource;
    }
}

import java.sql.*;
import java.util.*;
import com.zaxxer.hikari.HikariDataSource;

public class RecordSharingDAO {
    private final HikariDataSource dataSource;

    public RecordSharingDAO(HikariDataSource dataSource) {
        if (dataSource == null) {
            throw new IllegalArgumentException("DataSource cannot be null");
        }
        this.dataSource = dataSource;
    }

    public List<RecordSharing> getSharedRecords(String userIdentifier, String userType) {
        String sql = userType.equals("PROFESSIONAL") ?
            """
            SELECT * FROM Shared_Records 
            WHERE (sender_slmc = ? OR receiver_slmc = ?) 
            AND (
                (sender_slmc = ? AND receiver_slmc IS NOT NULL)
                OR (receiver_slmc = ? AND sender_slmc IS NOT NULL)
            )
            ORDER BY share_date DESC
            """ :
            """
            SELECT * FROM Shared_Records 
            WHERE (sender_institute_id = ? OR receiver_institute_id = ?) 
            AND (
                (sender_institute_id = ? AND receiver_institute_id IS NOT NULL)
                OR (receiver_institute_id = ? AND sender_institute_id IS NOT NULL)
            )
            ORDER BY share_date DESC
            """;
        
        List<RecordSharing> records = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userIdentifier);
            pstmt.setString(2, userIdentifier);
            pstmt.setString(3, userIdentifier);
            pstmt.setString(4, userIdentifier);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    RecordSharing record = new RecordSharing();
                    record.setRecordId(rs.getInt("record_id"));
                    record.setSenderSlmc(rs.getString("sender_slmc"));
                    record.setReceiverSlmc(rs.getString("receiver_slmc"));
                    record.setPatientPHN(rs.getString("patient_phn"));
                    record.setRecordType(rs.getString("record_type"));
                    record.setStatus(rs.getString("status"));
                    record.setShareDate(rs.getTimestamp("share_date"));
                    records.add(record);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return records;
    }

    public List<RecordRequest> getRecordRequests(String userIdentifier, String userType) {
        String sql = userType.equals("PROFESSIONAL") ?
            """
            SELECT * FROM Record_Requests 
            WHERE (requester_slmc = ? OR receiver_slmc = ?) 
            AND (
                (requester_slmc = ? AND receiver_slmc IS NOT NULL)
                OR (receiver_slmc = ? AND requester_slmc IS NOT NULL)
            )
            ORDER BY request_date DESC
            """ :
            """
            SELECT * FROM Record_Requests 
            WHERE (requester_institute_id = ? OR receiver_institute_id = ?) 
            AND (
                (requester_institute_id = ? AND receiver_institute_id IS NOT NULL)
                OR (receiver_institute_id = ? AND requester_institute_id IS NOT NULL)
            )
            ORDER BY request_date DESC
            """;
        
        List<RecordRequest> requests = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userIdentifier);
            pstmt.setString(2, userIdentifier);
            pstmt.setString(3, userIdentifier);
            pstmt.setString(4, userIdentifier);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    RecordRequest request = new RecordRequest();
                    request.setRequestId(rs.getInt("request_id"));
                    request.setRequesterSlmc(rs.getString("requester_slmc"));
                    request.setReceiverSlmc(rs.getString("receiver_slmc"));
                    request.setPatientPHN(rs.getString("patient_phn"));
                    request.setRecordType(rs.getString("record_type"));
                    request.setPurpose(rs.getString("purpose"));
                    request.setStatus(rs.getString("status"));
                    request.setRequestDate(rs.getTimestamp("request_date"));
                    requests.add(request);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return requests;
    }

    public boolean createRecordRequest(RecordRequest request) {
        String sql = "INSERT INTO Record_Requests (" +
                    (request.getRequesterType().equals("PROFESSIONAL") ? "requester_slmc" : "requester_institute_id") + ", " +
                    (request.getReceiverType().equals("PROFESSIONAL") ? "receiver_slmc" : "receiver_institute_id") + ", " +
                    "patient_phn, record_type, purpose, status, request_date, requester_type, receiver_type) " +
                    "VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, request.getRequesterId());
            pstmt.setString(2, request.getReceiverId());
            pstmt.setString(3, request.getPatientPHN());
            pstmt.setString(4, request.getRecordType());
            pstmt.setString(5, request.getPurpose());
            pstmt.setString(6, request.getRequesterType());
            pstmt.setString(7, request.getReceiverType());

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean shareRecord(RecordSharing record) {
        String sql = "INSERT INTO Shared_Records (" +
                    (record.getSenderType().equals("PROFESSIONAL") ? "sender_slmc" : "sender_institute_id") + ", " +
                    (record.getReceiverType().equals("PROFESSIONAL") ? "receiver_slmc" : "receiver_institute_id") + ", " +
                    "patient_phn, record_type, sub_type, file_path, status, share_date, sender_type, receiver_type) " +
                    "VALUES (?, ?, ?, ?, ?, ?, 'shared', CURRENT_TIMESTAMP, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, record.getSenderId());
            pstmt.setString(2, record.getReceiverId());
            pstmt.setString(3, record.getPatientPHN());
            pstmt.setString(4, record.getRecordType());
            pstmt.setString(5, record.getSubType());
            pstmt.setString(6, record.getFilePath());
            pstmt.setString(7, record.getSenderType());
            pstmt.setString(8, record.getReceiverType());

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
} 
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

    public List<RecordSharing> getSharedRecords(String id, String type) {
        List<RecordSharing> records = new ArrayList<>();
        String sql = "SELECT sr.*, " +
                    "CASE " +
                    "  WHEN sr.sender_type = 'PROFESSIONAL' THEN sp.Name " +
                    "  ELSE si.Name " +
                    "END as sender_name, " +
                    "CASE " +
                    "  WHEN sr.receiver_type = 'PROFESSIONAL' THEN rp.Name " +
                    "  ELSE ri.Name " +
                    "END as receiver_name " +
                    "FROM Shared_Records sr " +
                    "LEFT JOIN Healthcare_Professional sp ON sr.sender_slmc = sp.SLMC_No " +
                    "LEFT JOIN Healthcare_Professional rp ON sr.receiver_slmc = rp.SLMC_No " +
                    "LEFT JOIN Healthcare_Institute si ON sr.sender_institute_id = si.Institute_ID " +
                    "LEFT JOIN Healthcare_Institute ri ON sr.receiver_institute_id = ri.Institute_ID " +
                    "WHERE (sr.sender_type = ? AND (sr.sender_slmc = ? OR sr.sender_institute_id = ?)) OR " +
                    "(sr.receiver_type = ? AND (sr.receiver_slmc = ? OR sr.receiver_institute_id = ?)) " +
                    "ORDER BY sr.share_date DESC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, type);
            pstmt.setString(2, id);
            pstmt.setString(3, id);
            pstmt.setString(4, type);
            pstmt.setString(5, id);
            pstmt.setString(6, id);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                RecordSharing record = new RecordSharing();
                record.setRecordId(rs.getInt("record_id"));
                record.setSenderSlmc(rs.getString("sender_slmc"));
                record.setSenderInstituteId(rs.getString("sender_institute_id"));
                record.setReceiverSlmc(rs.getString("receiver_slmc"));
                record.setReceiverInstituteId(rs.getString("receiver_institute_id"));
                record.setPatientPHN(rs.getString("patient_phn"));
                record.setRecordType(rs.getString("record_type"));
                record.setSubType(rs.getString("sub_type"));
                record.setFilePath(rs.getString("file_path"));
                record.setStatus(rs.getString("status"));
                record.setShareDate(rs.getTimestamp("share_date"));
                record.setSenderType(rs.getString("sender_type"));
                record.setReceiverType(rs.getString("receiver_type"));
                record.setSenderName(rs.getString("sender_name"));
                record.setReceiverName(rs.getString("receiver_name"));
                records.add(record);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return records;
    }

    public List<RecordRequest> getRecordRequests(String id, String type) {
        List<RecordRequest> requests = new ArrayList<>();
        String sql = "SELECT rr.*, " +
                    "CASE " +
                    "  WHEN rr.requester_type = 'PROFESSIONAL' THEN hp.Name " +
                    "  ELSE hi.Name " +
                    "END as requester_name " +
                    "FROM Record_Requests rr " +
                    "LEFT JOIN Healthcare_Professional hp ON rr.requester_slmc = hp.SLMC_No " +
                    "LEFT JOIN Healthcare_Institute hi ON rr.requester_institute_id = hi.Institute_ID " +
                    "WHERE rr.receiver_type = ? AND " +
                    "(rr.receiver_slmc = ? OR rr.receiver_institute_id = ?) " +
                    "AND rr.status = 'pending' " +
                    "ORDER BY rr.request_date DESC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, type);
            pstmt.setString(2, id);
            pstmt.setString(3, id);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                RecordRequest request = new RecordRequest();
                request.setRequestId(rs.getInt("request_id"));
                request.setRequesterSlmc(rs.getString("requester_slmc"));
                request.setRequesterInstituteId(rs.getString("requester_institute_id"));
                request.setReceiverSlmc(rs.getString("receiver_slmc"));
                request.setReceiverInstituteId(rs.getString("receiver_institute_id"));
                request.setPatientPHN(rs.getString("patient_phn"));
                request.setRecordType(rs.getString("record_type"));
                request.setPurpose(rs.getString("purpose"));
                request.setStatus(rs.getString("status"));
                request.setRequestDate(rs.getTimestamp("request_date"));
                request.setRequesterType(rs.getString("requester_type"));
                request.setReceiverType(rs.getString("receiver_type"));
                request.setRequesterName(rs.getString("requester_name"));
                requests.add(request);
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
package com.smartstore.backend.security;

import com.smartstore.backend.model.Role;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Server-side policy enforcement for AI hub responses.
 *
 * The AI hub is treated as untrusted; this class ensures non-admin responses
 * cannot return cross-store data or unscoped SQL.
 */
public final class AiResponseGuardrail {
    private AiResponseGuardrail() {}

    private static boolean isTruthy(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(v.toString().trim());
    }

    public static Map<String, Object> enforce(Role role, Long sessionStoreId, Map<String, Object> aiResponse) {
        if (aiResponse == null) return Map.of();
        if (role == Role.ADMIN) return aiResponse;
        if (sessionStoreId == null) return aiResponse;

        boolean alreadyBlocked = isTruthy(aiResponse.get("blocked")) || isTruthy(aiResponse.get("guardrail_blocked"));
        if (alreadyBlocked) return aiResponse;

        // 1) If SQL is present, it must contain "store_id = <sessionStoreId>" (safety net).
        Object sqlRaw = aiResponse.get("sql");
        String sql = sqlRaw != null ? sqlRaw.toString() : "";
        if (!sql.isBlank()) {
            String lower = sql.toLowerCase();
            boolean hasStoreId = lower.contains("store_id");
            Pattern eq = Pattern.compile("(?s).*store_id\\s*=\\s*" + Pattern.quote(String.valueOf(sessionStoreId)) + ".*",
                    Pattern.CASE_INSENSITIVE);
            boolean hasEq = eq.matcher(sql).matches();
            if (!hasStoreId || !hasEq) {
                return blocked("filter_bypass_attempt", "STORE_SCOPE_REQUIRED",
                        "This request cannot be completed because it is missing the required store scope filter.");
            }
        }

        // 2) If requested_store_id is present, it must match sessionStoreId.
        Object requested = aiResponse.get("requested_store_id");
        if (requested != null) {
            try {
                long rid = Long.parseLong(requested.toString().trim());
                if (rid != sessionStoreId) {
                    return blocked("cross_store_access", "CROSS_STORE_BLOCKED",
                            "Cross-store access is not allowed for this session.");
                }
            } catch (Exception ignore) {
                // If it's malformed, treat it as untrusted and block.
                return blocked("cross_store_access", "CROSS_STORE_BLOCKED",
                        "Cross-store access is not allowed for this session.");
            }
        }

        return aiResponse;
    }

    private static Map<String, Object> blocked(String detectionType, String guardrail, String message) {
        Map<String, Object> out = new HashMap<>();
        out.put("success", false);
        out.put("blocked", true);
        out.put("detection_type", detectionType);
        out.put("guardrail", guardrail);
        out.put("response", message);
        out.put("sql", "");
        out.put("data", List.of());
        return out;
    }
}


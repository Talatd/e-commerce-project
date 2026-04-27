package com.smartstore.backend.security;

import com.smartstore.backend.model.Role;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings("all")
class AiResponseGuardrailTest {

    @Test
    void nonAdmin_sqlMissingStoreId_isBlocked() {
        Map<String, Object> resp = Map.of(
                "success", true,
                "sql", "SELECT * FROM orders",
                "data", java.util.List.of()
        );

        Map<String, Object> out = AiResponseGuardrail.enforce(Role.MANAGER, 1042L, resp);

        assertEquals(Boolean.TRUE, out.get("blocked"));
        assertEquals("STORE_SCOPE_REQUIRED", out.get("guardrail"));
        assertEquals("", out.get("sql"));
    }

    @Test
    void nonAdmin_sqlWithDifferentStoreId_isBlocked() {
        Map<String, Object> resp = Map.of(
                "success", true,
                "sql", "select * from orders where store_id = 2055",
                "data", java.util.List.of()
        );

        Map<String, Object> out = AiResponseGuardrail.enforce(Role.CONSUMER, 1042L, resp);

        assertEquals(Boolean.TRUE, out.get("blocked"));
        assertEquals("STORE_SCOPE_REQUIRED", out.get("guardrail"));
    }

    @Test
    void nonAdmin_sqlWithCorrectStoreId_passes() {
        Map<String, Object> resp = Map.of(
                "success", true,
                "sql", "SELECT * FROM orders WHERE store_id = 1042",
                "data", java.util.List.of()
        );

        Map<String, Object> out = AiResponseGuardrail.enforce(Role.MANAGER, 1042L, resp);

        assertNotEquals(Boolean.TRUE, out.get("blocked"));
        assertEquals(resp, out);
    }

    @Test
    void nonAdmin_requestedStoreIdMismatch_isBlocked() {
        Map<String, Object> resp = Map.of(
                "success", true,
                "requested_store_id", 2055,
                "sql", "",
                "data", java.util.List.of()
        );

        Map<String, Object> out = AiResponseGuardrail.enforce(Role.MANAGER, 1042L, resp);

        assertEquals(Boolean.TRUE, out.get("blocked"));
        assertEquals("CROSS_STORE_BLOCKED", out.get("guardrail"));
    }

    @Test
    void admin_isNotScoped() {
        Map<String, Object> resp = Map.of(
                "success", true,
                "sql", "SELECT * FROM orders",
                "data", java.util.List.of()
        );

        Map<String, Object> out = AiResponseGuardrail.enforce(Role.ADMIN, null, resp);

        assertEquals(resp, out);
    }
}


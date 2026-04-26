package com.smartstore.backend.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StockBroadcastService {

    private final SimpMessagingTemplate messaging;

    public void publish(StockEvent event) {
        if (event == null || event.productId() == null) return;
        messaging.convertAndSend("/topic/stock." + event.productId(), event);
    }
}


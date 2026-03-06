package com.ecommerce.backend.Controller;
import com.ecommerce.backend.dto.response.OrderResponse;
import com.ecommerce.backend.Services.OrderStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderStatusController {

    private final OrderStatusService orderStatusService;

    public OrderStatusController(OrderStatusService orderStatusService) {
        this.orderStatusService = orderStatusService;
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<OrderResponse> confirmOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderStatusService.confirmOrder(id));
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<OrderResponse> shipOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderStatusService.shipOrder(id));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<OrderResponse> deliverOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderStatusService.deliverOrder(id));
    }

    @GetMapping("/admin")
    public ResponseEntity<java.util.List<OrderResponse>> getAllOrdersForAdmin() {
        return ResponseEntity.ok(orderStatusService.getAllOrdersForAdmin());
    }
}
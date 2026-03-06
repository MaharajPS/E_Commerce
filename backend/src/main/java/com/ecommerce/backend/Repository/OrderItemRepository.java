package com.ecommerce.backend.Repository;

import com.ecommerce.backend.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalQuantity FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.status != 'CANCELLED' GROUP BY oi.product.id")
    List<Object[]> findTotalQuantityByProduct();
}

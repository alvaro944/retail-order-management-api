package com.alvaro.retail.order.service;

import com.alvaro.retail.order.dto.OrderCreateRequest;
import com.alvaro.retail.order.dto.OrderResponse;
import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderCreateRequest request);

    List<OrderResponse> getOrders();

    OrderResponse getOrderById(Long id);
}

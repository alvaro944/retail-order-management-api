package com.alvaro.retail.order.service;

import com.alvaro.retail.common.exception.BusinessConflictException;
import com.alvaro.retail.common.exception.InvalidRequestException;
import com.alvaro.retail.common.exception.ResourceNotFoundException;
import com.alvaro.retail.customer.entity.Customer;
import com.alvaro.retail.customer.repository.CustomerRepository;
import com.alvaro.retail.inventory.entity.Inventory;
import com.alvaro.retail.inventory.repository.InventoryRepository;
import com.alvaro.retail.order.dto.OrderCreateRequest;
import com.alvaro.retail.order.dto.OrderCustomerSummary;
import com.alvaro.retail.order.dto.OrderItemRequest;
import com.alvaro.retail.order.dto.OrderItemResponse;
import com.alvaro.retail.order.dto.OrderResponse;
import com.alvaro.retail.order.entity.Order;
import com.alvaro.retail.order.entity.OrderItem;
import com.alvaro.retail.order.entity.OrderStatus;
import com.alvaro.retail.order.repository.OrderRepository;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public OrderServiceImpl(
        OrderRepository orderRepository,
        CustomerRepository customerRepository,
        ProductRepository productRepository,
        InventoryRepository inventoryRepository
    ) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        Customer customer = customerRepository.findByIdAndActiveTrue(request.customerId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + request.customerId() + " was not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.CREATED);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<Inventory> inventoriesToUpdate = new ArrayList<>();
        Set<Long> productIds = new HashSet<>();

        for (OrderItemRequest itemRequest : request.items()) {
            if (!productIds.add(itemRequest.productId())) {
                throw new InvalidRequestException("Product with id " + itemRequest.productId() + " is duplicated in the order");
            }

            Product product = productRepository.findByIdAndActiveTrue(itemRequest.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + itemRequest.productId() + " was not found"));

            Inventory inventory = inventoryRepository.findByProductIdAndProductActiveTrue(product.getId())
                .orElseThrow(() -> new BusinessConflictException("Product with id " + product.getId() + " does not have available stock"));

            if (inventory.getQuantityAvailable() < itemRequest.quantity()) {
                throw new BusinessConflictException("Product with id " + product.getId() + " does not have enough stock");
            }

            inventory.setQuantityAvailable(inventory.getQuantityAvailable() - itemRequest.quantity());
            inventoriesToUpdate.add(inventory);

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setProductSku(product.getSku());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(itemRequest.quantity());
            item.setSubtotal(subtotal);
            order.addItem(item);
        }

        order.setTotalAmount(totalAmount);
        inventoryRepository.saveAll(inventoriesToUpdate);

        Order savedOrder = orderRepository.saveAndFlush(order);
        return toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order with id " + orderId + " was not found"));

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessConflictException("Order with id " + orderId + " is already cancelled");
        }

        List<Inventory> inventoriesToUpdate = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Long productId = item.getProduct().getId();
            Inventory inventory = inventoryRepository.findByProductIdAndProductActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for product with id " + productId + " was not found"));

            inventory.setQuantityAvailable(inventory.getQuantityAvailable() + item.getQuantity());
            inventoriesToUpdate.add(inventory);
        }

        inventoryRepository.saveAll(inventoriesToUpdate);
        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.saveAndFlush(order);
        return toResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getOrders() {
        return orderRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " was not found"));
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        Customer customer = order.getCustomer();
        return new OrderResponse(
            order.getId(),
            new OrderCustomerSummary(customer.getId(), customer.getFirstName(), customer.getLastName(), customer.getEmail()),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getItems().stream().map(this::toItemResponse).toList(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getProductName(),
            item.getProductSku(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getSubtotal()
        );
    }
}

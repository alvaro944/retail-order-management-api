package com.alvaro.retail.common.config;

import com.alvaro.retail.customer.entity.Customer;
import com.alvaro.retail.customer.repository.CustomerRepository;
import com.alvaro.retail.inventory.entity.Inventory;
import com.alvaro.retail.inventory.repository.InventoryRepository;
import com.alvaro.retail.order.dto.OrderCreateRequest;
import com.alvaro.retail.order.dto.OrderItemRequest;
import com.alvaro.retail.order.repository.OrderRepository;
import com.alvaro.retail.order.service.OrderService;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevelopmentDemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevelopmentDemoDataSeeder.class);

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Value("${app.demo-seed.enabled:true}")
    private boolean demoSeedEnabled;

    @Override
    public void run(String... args) {
        if (!demoSeedEnabled) {
            log.info("Development demo seed disabled.");
            return;
        }

        if (productRepository.count() == 0 && customerRepository.count() == 0 && inventoryRepository.count() == 0) {
            seedCatalog();
        } else {
            log.info("Development demo catalog already present. Skipping base catalog seed.");
        }

        seedOrdersIfPossible();
    }

    private void seedCatalog() {
        List<Product> products = productRepository.saveAll(List.of(
                buildProduct("Notebook A5 Softcover", "LIB-A5-001", "Notebook for store notes, fulfilment marks, and daily ops.", "12.90"),
                buildProduct("Wireless Barcode Scanner", "OPS-SCN-210", "Compact scanner for checkout, picking, and returns handling.", "89.00"),
                buildProduct("Thermal Label Roll", "OPS-LBL-050", "Adhesive labels for shelf tags, dispatch, and internal stock control.", "19.50"),
                buildProduct("Desktop Receipt Printer", "OPS-PRN-330", "Fast thermal receipt printer for counters and service desks.", "149.00"),
                buildProduct("Packaging Tape 6 Pack", "WH-TAPE-006", "Warehouse-grade tape for routine order preparation.", "24.00")
        ));

        customerRepository.saveAll(List.of(
                buildCustomer("Lucia", "Navarro", "lucia.navarro@example.com", "+34 600 111 111"),
                buildCustomer("Mateo", "Serrano", "mateo.serrano@example.com", "+34 600 222 222"),
                buildCustomer("Carmen", "Vega", "carmen.vega@example.com", "+34 600 333 333")
        ));

        inventoryRepository.saveAll(List.of(
                buildInventory(products.get(0), 48, 12),
                buildInventory(products.get(1), 14, 4),
                buildInventory(products.get(2), 72, 18),
                buildInventory(products.get(3), 9, 3),
                buildInventory(products.get(4), 31, 8)
        ));

        log.info("Development demo seed completed: {} products, {} customers, {} inventory records.",
                products.size(),
                3,
                5);
    }

    private void seedOrdersIfPossible() {
        if (orderRepository.count() > 0) {
            log.info("Development demo orders already present. Skipping order seed.");
            return;
        }

        Map<String, Product> productsBySku = productRepository.findAll().stream()
                .filter(Product::isActive)
                .collect(java.util.stream.Collectors.toMap(Product::getSku, Function.identity()));
        Map<String, Customer> customersByEmail = customerRepository.findAll().stream()
                .filter(Customer::isActive)
                .collect(java.util.stream.Collectors.toMap(Customer::getEmail, Function.identity()));

        Product notebook = productsBySku.get("LIB-A5-001");
        Product scanner = productsBySku.get("OPS-SCN-210");
        Product labels = productsBySku.get("OPS-LBL-050");
        Product printer = productsBySku.get("OPS-PRN-330");
        Product tape = productsBySku.get("WH-TAPE-006");

        Customer lucia = customersByEmail.get("lucia.navarro@example.com");
        Customer mateo = customersByEmail.get("mateo.serrano@example.com");
        Customer carmen = customersByEmail.get("carmen.vega@example.com");

        if (notebook == null || scanner == null || labels == null || printer == null || tape == null
                || lucia == null || mateo == null || carmen == null) {
            log.info("Development demo orders skipped because the expected demo catalog is not fully available.");
            return;
        }

        Long orderOneId = orderService.createOrder(new OrderCreateRequest(
                lucia.getId(),
                List.of(
                        new OrderItemRequest(notebook.getId(), 6),
                        new OrderItemRequest(tape.getId(), 3)
                ))).id();

        orderService.createOrder(new OrderCreateRequest(
                mateo.getId(),
                List.of(
                        new OrderItemRequest(scanner.getId(), 2)
                )));

        Long orderThreeId = orderService.createOrder(new OrderCreateRequest(
                carmen.getId(),
                List.of(
                        new OrderItemRequest(labels.getId(), 10),
                        new OrderItemRequest(printer.getId(), 1)
                ))).id();

        orderService.cancelOrder(orderThreeId);

        orderService.createOrder(new OrderCreateRequest(
                carmen.getId(),
                List.of(
                        new OrderItemRequest(printer.getId(), 2),
                        new OrderItemRequest(labels.getId(), 5)
                )));

        log.info("Development demo order seed completed. Created active orders including one historical cancellation. First order id: {}.",
                orderOneId);
    }

    private Product buildProduct(String name, String sku, String description, String price) {
        Product product = new Product();
        product.setName(name);
        product.setSku(sku);
        product.setDescription(description);
        product.setPrice(new BigDecimal(price));
        product.setActive(true);
        return product;
    }

    private Customer buildCustomer(String firstName, String lastName, String email, String phone) {
        Customer customer = new Customer();
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setActive(true);
        return customer;
    }

    private Inventory buildInventory(Product product, int quantityAvailable, int minimumStock) {
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantityAvailable(quantityAvailable);
        inventory.setMinimumStock(minimumStock);
        return inventory;
    }
}

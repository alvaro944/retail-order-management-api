package com.alvaro.retail.product.service;

import com.alvaro.retail.common.exception.DuplicateResourceException;
import com.alvaro.retail.common.exception.ResourceNotFoundException;
import com.alvaro.retail.product.dto.ProductCreateRequest;
import com.alvaro.retail.product.dto.ProductResponse;
import com.alvaro.retail.product.dto.ProductUpdateRequest;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        ensureSkuIsUnique(request.sku());

        Product product = new Product();
        applyChanges(product, request.name(), request.description(), request.price(), request.sku());

        Product savedProduct = productRepository.saveAndFlush(product);
        return toResponse(savedProduct);
    }

    @Override
    public List<ProductResponse> getProducts() {
        return productRepository.findAllByActiveTrueOrderByNameAsc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return toResponse(getActiveProduct(id));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = getActiveProduct(id);

        ensureSkuIsUniqueForUpdate(request.sku(), id);
        applyChanges(product, request.name(), request.description(), request.price(), request.sku());

        Product updatedProduct = productRepository.saveAndFlush(product);
        return toResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getActiveProduct(id);
        product.setActive(false);
        productRepository.saveAndFlush(product);
    }

    private Product getActiveProduct(Long id) {
        return productRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " was not found"));
    }

    private void ensureSkuIsUnique(String sku) {
        if (productRepository.existsBySku(sku)) {
            throw new DuplicateResourceException("Product with sku " + sku + " already exists");
        }
    }

    private void ensureSkuIsUniqueForUpdate(String sku, Long id) {
        if (productRepository.existsBySkuAndIdNot(sku, id)) {
            throw new DuplicateResourceException("Product with sku " + sku + " already exists");
        }
    }

    private void applyChanges(Product product, String name, String description, java.math.BigDecimal price, String sku) {
        product.setName(name.trim());
        product.setDescription(description == null ? null : description.trim());
        product.setPrice(price);
        product.setSku(sku.trim());
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getSku(),
            product.isActive(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}

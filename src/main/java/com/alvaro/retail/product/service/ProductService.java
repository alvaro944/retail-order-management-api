package com.alvaro.retail.product.service;

import com.alvaro.retail.product.dto.ProductCreateRequest;
import com.alvaro.retail.product.dto.ProductResponse;
import com.alvaro.retail.product.dto.ProductUpdateRequest;
import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductCreateRequest request);

    List<ProductResponse> getProducts();

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, ProductUpdateRequest request);

    void deleteProduct(Long id);
}

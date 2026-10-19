package com.example.cruddemo.service;

import com.example.cruddemo.model.Product;
import com.example.cruddemo.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Cacheable(cacheNames = "productById", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));
    }

    public Page<Product> getProducts(Pageable pageable, String name) {
        if (name == null || name.isBlank()) {
            return productRepository.findAll(pageable);
        }
        return productRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getProductsByPriceRange(double min, double max) {
        return productRepository.findByPriceBetween(min, max);
    }

    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByQuantityLessThanEqual(threshold);
    }

    public List<Product> getInStockProducts() {
        return productRepository.findByQuantityGreaterThan(0);
    }

    public long getProductCount() {
        return productRepository.count();
    }

    public InventorySummary getInventorySummary() {
        return new InventorySummary(
                productRepository.count(),
                productRepository.sumQuantity(),
                productRepository.sumInventoryValue(),
                productRepository.countLowStock(10));
    }

    @CacheEvict(cacheNames = "productById", key = "#id")
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));

        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setQuantity(productDetails.getQuantity());
        product.setRating(productDetails.getRating());

        return productRepository.save(product);
    }

    @CacheEvict(cacheNames = "productById", key = "#id")
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));
        productRepository.delete(product);
    }

    public record InventorySummary(long totalProducts, long unitsInStock,
                                   double inventoryValue, long lowStockProducts) {}
}

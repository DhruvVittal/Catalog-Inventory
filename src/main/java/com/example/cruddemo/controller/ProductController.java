package com.example.cruddemo.controller;

import com.example.cruddemo.model.Product;
import com.example.cruddemo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must not be blank");
        }
        return productRepository.findByNameContainingIgnoreCase(name.trim());
    }

    @GetMapping("/price-range")
    public List<Product> getProductsByPriceRange(@RequestParam double min,
                                                 @RequestParam double max) {
        if (min < 0 || max < min) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "min must be non-negative and max must be greater than or equal to min");
        }
        return productRepository.findByPriceBetween(min, max);
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts(@RequestParam(defaultValue = "10") int threshold) {
        if (threshold < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "threshold must be non-negative");
        }
        return productRepository.findByQuantityLessThanEqual(threshold);
    }

    @GetMapping("/in-stock")
    public List<Product> getInStockProducts() {
        return productRepository.findByQuantityGreaterThan(0);
    }

    @GetMapping("/count")
    public long getProductCount() {
        return productRepository.count();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = findProductOrThrow(id);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = findProductOrThrow(id);

        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setQuantity(productDetails.getQuantity());

        Product updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        Product product = findProductOrThrow(id);

        productRepository.delete(product);
        return ResponseEntity.ok("Product deleted successfully with id: " + id);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));
    }
}

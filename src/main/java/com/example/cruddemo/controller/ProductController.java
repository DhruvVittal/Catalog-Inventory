package com.example.cruddemo.controller;

import com.example.cruddemo.model.Product;
import com.example.cruddemo.repository.ProductRepository;
import com.example.cruddemo.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

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
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully with id: " + id);
    }
}

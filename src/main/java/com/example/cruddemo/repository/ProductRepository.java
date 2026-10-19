package com.example.cruddemo.repository;

import com.example.cruddemo.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByPriceBetween(double minPrice, double maxPrice);

    List<Product> findByQuantityLessThanEqual(int threshold);

    List<Product> findByQuantityGreaterThan(int quantity);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Product p")
    long sumQuantity();

    @Query("SELECT COALESCE(SUM(p.price * p.quantity), 0) FROM Product p")
    double sumInventoryValue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= :threshold")
    long countLowStock(@Param("threshold") int threshold);
}

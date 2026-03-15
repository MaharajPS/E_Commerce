package com.ecommerce.backend.exception;


public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String entityType, String field, Object value) {
        super(String.format("%s not found with %s: %s", entityType, field, value));
    }
}

package com.tindatrack.backend.service;

public interface PricingStrategy {
    double calculateTotal(double price, int quantity);
}
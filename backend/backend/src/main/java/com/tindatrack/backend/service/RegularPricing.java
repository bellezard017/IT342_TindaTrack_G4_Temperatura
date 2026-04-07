package com.tindatrack.backend.service;

public class RegularPricing implements PricingStrategy {
    public double calculateTotal(double price, int quantity) {
        return price * quantity;
    }
}
package com.tindatrack.backend.features.sales;

import com.tindatrack.backend.dto.SaleRequest;
import com.tindatrack.backend.dto.SaleResponse;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.service.ActivityLogService;
import com.tindatrack.backend.service.EmailService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SaleServiceTest {

    private final SaleRepository saleRepository = mock(SaleRepository.class);
    private final ActivityLogService activityLogService = mock(ActivityLogService.class);
    private final EmailService emailService = mock(EmailService.class);
    private final SaleService saleService = new SaleService(
            saleRepository,
            activityLogService,
            emailService
    );

    @Test
    void createSaleCalculatesTotalAndRecordsSideEffects() {
        User user = new User();
        user.setId(7L);
        user.setName("Mika");
        user.setEmail("mika@example.com");
        user.setStoreId(12L);
        user.setStoreName("Temperatura Store");

        SaleRequest request = new SaleRequest("Coffee", "Beverages", 3, 25.0);

        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> {
            Sale sale = invocation.getArgument(0);
            sale.setId(99L);
            return sale;
        });

        Sale saved = saleService.createSale(user, request);

        assertThat(saved.getId()).isEqualTo(99L);
        assertThat(saved.getStoreId()).isEqualTo(12L);
        assertThat(saved.getItemName()).isEqualTo("Coffee");
        assertThat(saved.getTotalPrice()).isEqualTo(75.0);

        verify(activityLogService).log(
                eq("add"),
                eq("Added sale: Coffee"),
                eq("7"),
                eq("Mika"),
                eq(75.0),
                eq(12L)
        );
        verify(emailService).sendSaleConfirmationEmail(
                eq("mika@example.com"),
                eq("Mika"),
                eq("Coffee"),
                eq(3),
                eq(25.0),
                eq(75.0),
                eq("Temperatura Store")
        );
    }

    @Test
    void mapToResponseKeepsSaleFieldsForWebAndMobileClients() {
        Sale sale = new Sale();
        sale.setId(5L);
        sale.setItemName("Rice");
        sale.setCategory("Rice & Grains");
        sale.setQuantity(2);
        sale.setPrice(55.0);
        sale.setTotalPrice(110.0);
        sale.setCreatedBy("Ana");
        sale.setSaleDate(LocalDateTime.of(2026, 5, 8, 9, 30));

        SaleResponse response = saleService.mapToResponse(sale);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getDate()).isEqualTo("May 8, 2026 9:30 AM");
        assertThat(response.getName()).isEqualTo("Rice");
        assertThat(response.getCategory()).isEqualTo("Rice & Grains");
        assertThat(response.getQuantity()).isEqualTo(2);
        assertThat(response.getPrice()).isEqualTo(55.0);
        assertThat(response.getTotal()).isEqualTo(110.0);
        assertThat(response.getCreatedBy()).isEqualTo("Ana");
    }
}

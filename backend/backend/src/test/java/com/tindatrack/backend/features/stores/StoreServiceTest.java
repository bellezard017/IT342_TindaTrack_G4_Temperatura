package com.tindatrack.backend.features.stores;

import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StoreServiceTest {

    private final StoreRepository storeRepository = mock(StoreRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final StoreService storeService = new StoreService(storeRepository, userRepository);

    @Test
    void createStoreForOwnerGeneratesCodeAndPersistsStore() {
        User owner = new User();
        owner.setId(42L);

        when(storeRepository.findByCode(any())).thenReturn(Optional.empty());
        when(storeRepository.save(any(Store.class))).thenAnswer(invocation -> {
            Store store = invocation.getArgument(0);
            store.setId(15L);
            return store;
        });

        Store store = storeService.createStoreForOwner(owner, "  TindaTrack Mini Mart  ");

        assertThat(store.getId()).isEqualTo(15L);
        assertThat(store.getName()).isEqualTo("TindaTrack Mini Mart");
        assertThat(store.getOwnerId()).isEqualTo(42L);
        assertThat(store.getCode()).hasSize(8);
        assertThat(store.getCreatedAt()).isNotNull();
        verify(storeRepository).save(any(Store.class));
    }

    @Test
    void assignStoreToUserLinksStaffToExistingStore() {
        Store store = new Store();
        store.setId(3L);
        store.setName("Main Store");
        store.setCode("ABCD1234");

        User staff = new User();
        staff.setId(9L);

        when(storeRepository.findByCode("ABCD1234")).thenReturn(Optional.of(store));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User assigned = storeService.assignStoreToUser(staff, " abcd1234 ");

        assertThat(assigned.getStoreId()).isEqualTo(3L);
        assertThat(assigned.getRole()).isEqualTo("STAFF");
        assertThat(assigned.getStoreName()).isEqualTo("Main Store");
        assertThat(assigned.getStoreCode()).isEqualTo("ABCD1234");
        verify(userRepository).save(staff);
    }
}

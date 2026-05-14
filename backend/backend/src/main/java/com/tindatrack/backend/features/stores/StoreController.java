package com.tindatrack.backend.features.stores;

import com.tindatrack.backend.dto.StoreJoinRequest;
import com.tindatrack.backend.dto.StoreSetupRequest;
import com.tindatrack.backend.model.ActivityLog;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    private final StoreService storeService;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public StoreController(StoreService storeService,
                           UserRepository userRepository,
                           ActivityLogService activityLogService) {
        this.storeService = storeService;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @PostMapping("/setup")
    public ResponseEntity<User> setupStore(
            @Valid @RequestBody StoreSetupRequest request,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null)
            return ResponseEntity.status(401).build();

        User user = storeService.setupStoreByEmail(
                authentication.getName(), request.getStoreName());
        activityLogService.log(
                "store",
                "Created store: " + user.getStoreName(),
                String.valueOf(user.getId()),
                user.getName(),
                null,
                user.getStoreId()
        );
        return ResponseEntity.ok(user);
    }

    @PostMapping("/join")
    public ResponseEntity<User> joinStore(
            @Valid @RequestBody StoreJoinRequest request,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null)
            return ResponseEntity.status(401).build();

        User user = storeService.joinStoreByEmail(
                authentication.getName(), request.getStoreCode());
        activityLogService.log(
                "store",
                "Joined store: " + user.getStoreName(),
                String.valueOf(user.getId()),
                user.getName(),
                null,
                user.getStoreId()
        );
        return ResponseEntity.ok(user);
    }

    @GetMapping("/team")
    public ResponseEntity<List<User>> getStoreTeam(Authentication authentication) {
        if (authentication == null || authentication.getName() == null)
            return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));

        if (user.getStoreId() == null)
            return ResponseEntity.ok(List.of());

        List<User> storeUsers = storeService.getStoreUsers(user.getStoreId());
        return ResponseEntity.ok(storeUsers.stream()
                .map(member -> { member.setPassword(null); return member; })
                .collect(Collectors.toList()));
    }

    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long memberId,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null)
            return ResponseEntity.status(401).build();

        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));

        if (!"OWNER".equalsIgnoreCase(requester.getRole()))
            return ResponseEntity.status(403).body("Only store owners can remove members.");

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Store member not found."));

        if (requester.getId().equals(member.getId())) {
            return ResponseEntity.status(400).body("Store owners cannot remove themselves.");
        }

        if (member.getStoreId() == null || !member.getStoreId().equals(requester.getStoreId())) {
            return ResponseEntity.status(404).body("Store member not found.");
        }

        activityLogService.log(
                "delete",
                "Removed staff: " + member.getName(),
                String.valueOf(requester.getId()),
                requester.getName(),
                null,
                requester.getStoreId()
        );

        member.setStoreId(null);
        userRepository.save(member);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLog>> getActivity(Authentication authentication) {
        if (authentication == null || authentication.getName() == null)
            return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));

        if (user.getStoreId() == null)
            return ResponseEntity.ok(List.of());

        List<ActivityLog> logs = activityLogService.getAllByStore(user.getStoreId());
        return ResponseEntity.ok(logs);
    }
}

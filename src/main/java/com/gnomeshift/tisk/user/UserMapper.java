package com.gnomeshift.tisk.user;

import com.gnomeshift.tisk.ticket.TicketMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TicketMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface UserMapper {
    UserDTO toDto(User user);

    List<UserDTO> toDtoList(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "reportedTickets", ignore = true)
    @Mapping(target = "assignedTickets", ignore = true)
    User toEntity(CreateUserDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "reportedTickets", ignore = true)
    @Mapping(target = "assignedTickets", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    void updateUserFromDto(UpdateUserDTO dto, @MappingTarget User user);
}

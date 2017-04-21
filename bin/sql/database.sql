create database schedules;
use schedules;

create table users(
    id int not null auto_increment,
    username varchar(256),
    password varchar(256),
    created_date datetime,
    primary key (id),
    unique(username)
);

create table user_sessions(
    id int not null auto_increment,
    user int,
    token varchar(256),
    expiration datetime,
    persist tinyint,
    primary key (id),
    foreign key (user) references users(id),
    index (id, user),
    created_date datetime,
    updated_date datetime
);

create table rpi (
	id varchar(16) not null,
    user_id int,
    created_date date,
    primary key(id),
    foreign key (user_id) references users(id),
    index `user` (user_id)
);

create table schedule (
	id int not null auto_increment,
    rpi_id varchar(16) not null,
    name varchar(256),
    zone tinyint,
    dow varchar(64),
    start varchar(5),
    duration varchar(5),
    created_date datetime,
    modified_date timestamp default 
			current_timestamp on update current_timestamp,
    primary key(id),
    foreign key (rpi_id) references rpi(id),
    index `rpi` (rpi_id)
);
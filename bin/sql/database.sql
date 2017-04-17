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
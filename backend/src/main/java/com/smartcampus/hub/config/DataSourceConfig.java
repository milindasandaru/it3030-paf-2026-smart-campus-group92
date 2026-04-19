package com.smartcampus.hub.config;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public HikariDataSource dataSource(DataSourceProperties properties) {
        ConnectionInfo connectionInfo = normalizeConnectionInfo(
                properties.getUrl(), properties.getUsername(), properties.getPassword());

        HikariDataSource dataSource =
                properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
        dataSource.setJdbcUrl(connectionInfo.url());

        if (StringUtils.hasText(connectionInfo.username())) {
            dataSource.setUsername(connectionInfo.username());
        }
        if (connectionInfo.password() != null) {
            dataSource.setPassword(connectionInfo.password());
        }

        return dataSource;
    }

    private ConnectionInfo normalizeConnectionInfo(String rawUrl, String username, String password) {
        if (!StringUtils.hasText(rawUrl)) {
            return new ConnectionInfo(rawUrl, username, password);
        }

        if (rawUrl.startsWith("jdbc:")) {
            return new ConnectionInfo(rawUrl, username, password);
        }

        if (!rawUrl.startsWith("postgresql://") && !rawUrl.startsWith("postgres://")) {
            return new ConnectionInfo(rawUrl, username, password);
        }

        URI uri = URI.create(rawUrl);
        String host = uri.getHost();
        int port = uri.getPort();
        String path = uri.getPath();

        String jdbcUrl = "jdbc:postgresql://" + host + (port > 0 ? ":" + port : "") + path;
        if (StringUtils.hasText(uri.getQuery())) {
            jdbcUrl += "?" + uri.getQuery();
        }

        String resolvedUsername = username;
        String resolvedPassword = password;
        if (!StringUtils.hasText(resolvedUsername) && StringUtils.hasText(uri.getUserInfo())) {
            String[] userInfo = uri.getUserInfo().split(":", 2);
            resolvedUsername = userInfo[0];
            resolvedPassword = userInfo.length > 1 ? userInfo[1] : resolvedPassword;
        }

        return new ConnectionInfo(jdbcUrl, resolvedUsername, resolvedPassword);
    }

    private record ConnectionInfo(String url, String username, String password) {}
}

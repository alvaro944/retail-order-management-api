package com.alvaro.retail.common.exception;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

@Component
public class ProblemDetailFactory {

    public ProblemDetail create(HttpStatus status, String detail, String path) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
        problemDetail.setTitle(status.getReasonPhrase());
        problemDetail.setType(URI.create("about:blank"));
        problemDetail.setProperty("path", path);
        return problemDetail;
    }
}

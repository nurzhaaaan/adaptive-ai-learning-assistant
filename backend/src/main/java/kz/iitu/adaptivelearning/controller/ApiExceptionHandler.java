package kz.iitu.adaptivelearning.controller;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler({IllegalArgumentException.class, java.util.NoSuchElementException.class})
 public ResponseEntity<Map<String,Object>> badRequest(Exception e){return ResponseEntity.badRequest().body(Map.of("timestamp", LocalDateTime.now().toString(),"error",e.getMessage()));}
 @ExceptionHandler(Exception.class)
 public ResponseEntity<Map<String,Object>> error(Exception e){return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("timestamp",LocalDateTime.now().toString(),"error",e.getMessage()==null?"Unexpected error":e.getMessage()));}
}

package kz.iitu.adaptivelearning.controller;
import java.util.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import kz.iitu.adaptivelearning.service.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController
@RequestMapping("/api/academic")
@Transactional
public class AcademicProfileController {
 private final CurrentUserService current;
 private final AcademicProfileRepository profiles;
 private final CourseRepository courses;
 public AcademicProfileController(CurrentUserService current,AcademicProfileRepository profiles,CourseRepository courses){this.current=current;this.profiles=profiles;this.courses=courses;}
 public record Profile(String mode,String university,String major,Integer studyYear,String goal,Set<Long> courseIds){}
 public record CatalogItem(Long id,String title,String code){}
 @GetMapping("/catalog") public List<CatalogItem> catalog(){current.requireUser();return courses.findAll().stream().map(c->new CatalogItem(c.getId(),c.getTitle(),c.getCode())).toList();}
 @GetMapping("/profile") public Profile profile(){return profiles.findById(current.requireUser().getId()).map(this::view).orElse(new Profile("", "", "",null,"",Set.of()));}
 @PutMapping("/profile") public Profile save(@RequestBody Profile p){
  User u=current.requireUser();
  if(u.getRole()!=Role.STUDENT)throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  if(!Set.of("UNIVERSITY","SELF").contains(Objects.toString(p.mode(),"")))bad("Choose learning mode");
  if("UNIVERSITY".equals(p.mode())&&(blank(p.university())||blank(p.major())||p.studyYear()==null||p.studyYear()<1||p.studyYear()>6))bad("University, major and year required");
  if("SELF".equals(p.mode())&&blank(p.goal()))bad("Learning goal required");
  if(p.courseIds()==null||p.courseIds().isEmpty()||p.courseIds().size()>100||p.courseIds().contains(null))bad("Choose available courses");
  if(courses.findAllById(p.courseIds()).size()!=p.courseIds().size())bad("Unknown course");
  AcademicProfile a=profiles.findById(u.getId()).orElseGet(AcademicProfile::new);
  a.userId=u.getId();a.mode=p.mode();a.university=clean(p.university(),200);a.major=clean(p.major(),160);a.studyYear="UNIVERSITY".equals(p.mode())?p.studyYear():null;a.goal=clean(p.goal(),300);a.courseIds.clear();a.courseIds.addAll(p.courseIds());
  return view(profiles.save(a));
 }
 private Profile view(AcademicProfile a){return new Profile(a.mode,a.university,a.major,a.studyYear,a.goal,Set.copyOf(a.courseIds));}
 private static boolean blank(String s){return s==null||s.isBlank();}
 private static String clean(String s,int n){if(s==null)return "";if(s.length()>n)bad("Text too long");return s.trim();}
 private static void bad(String message){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
}

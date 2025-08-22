import { TestBed } from "@angular/core/testing"
import { CoursesService } from "./courses.service"
import {  HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { Course } from "../model/course";


describe("CoursesService",()=>{

    let coursesService : CoursesService,
     httpTestingController: HttpTestingController;

    beforeEach(()=>{
        TestBed.configureTestingModule({
            providers:[
                CoursesService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        });
        coursesService = TestBed.inject(CoursesService);
        httpTestingController =TestBed.inject(HttpTestingController);
    })
    it('should retrive all the courses',()=>{
        coursesService.findAllCourses().subscribe(courses=>{
            expect(courses).toBeTruthy('No courses returned');
            expect(courses.length).toBe(12,"incorrect number of courses")
        })
        const req = httpTestingController.expectOne('/api/courses');
        expect(req.request.method).toEqual("GET");
        req.flush({payload:Object.values(COURSES)});


    })

    it('should find the course by id',()=>{
        coursesService.findCourseById(12).subscribe(courseId=>{
            expect(courseId).toBeTruthy();
            expect(courseId.id).toBe(12);
        });
       const req =  httpTestingController.expectOne('/api/courses/12');
       expect(req.request.method).toEqual("GET");
       req.flush(COURSES[12])
    })
    
    it('should save the course data',()=>{
        const changes:Partial<Course> =
        {titles:{description:'Testing Course'}}

        coursesService.saveCourse(12,changes).subscribe(courses=>{
            expect(courses.id).toBe(12);
        });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("PUT");
        expect(req.request.body.titles.description).toEqual(changes.titles.description)

        req.flush({
            ...COURSES[12],
            ...changes
        })

    })

    it('should give error if course not saved',()=>{
        const changes:Partial<Course> =
        {titles:{description:'Testing Course'}}
        coursesService.saveCourse(12,changes)
        .subscribe(
            ()=> fail ('the save operation should have failed'),
            (error:HttpErrorResponse)=>{
                expect(error.status).toBe(500);
            
        }
    );
    const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("PUT");
    req.flush('Save Course Failed',{status:500, statusText:'Internal server error'})

    });

     it('should find list of lessons',()=>{
        coursesService.findLessons(12).subscribe(lessons=>{
            console.log("lesson",lessons)
            expect(lessons).toBeTruthy();
            expect(lessons.length).toBe(3);
        });
       const req =  httpTestingController.expectOne(req=>req.url=='/api/lessons');
       expect(req.request.method).toEqual("GET");
       expect(req.request.params.get('courseId')).toEqual('12')
        expect(req.request.params.get('filter')).toEqual("")
        expect(req.request.params.get('sortOrder')).toEqual("asc")
        expect(req.request.params.get('pageNumber')).toEqual("0")
        expect(req.request.params.get('pageSize')).toEqual("3")
       req.flush({
        payload:findLessonsForCourse(12).slice(0,3)
       })
    })

    afterEach(()=>{
        httpTestingController.verify();
    })
})
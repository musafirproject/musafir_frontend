import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserListService } from '../../user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assign-hotles',
  templateUrl: './assign-hotles.component.html',
  styleUrls: ['./assign-hotles.component.css']
})
export class AssignHotlesComponent implements OnInit {

  hotels: any[] = []; 
  searchValue: string = ''; // Bind the search input value
  selectedHotelIds: number[] = []; // To store selected hotel IDs
  existingHotelIds: number[] = []; // IDs of hotels already assigned to the user
  public guestUserAccountId; 
  filteredHotels: any[] = []; // Filtered hotels to display
  selectAll: boolean = false; // Track "Select All" state




  userId: string | null = null;

  constructor(
    private service: UserListService, 
    private cdr: ChangeDetectorRef, 
    private translate: TranslateService, 
    private toastr: ToastrService,
    private router: Router,
    private routes: ActivatedRoute
  

  ) { }

  ngOnInit(): void {
    this.getHotels();
    this.routes.params.subscribe({
      next: (id:any)=>{
        
        this.userId= id?.userId; 
      }
    })
    this.getGuestUserHotels();

    
  }

  onSelectAll(): void {
    if (this.selectAll) {
      this.selectedHotelIds = this.filteredHotels.map(hotel => hotel.id);
    } else {
      this.selectedHotelIds = [];
    }
  }

  

  public getHotels(){
    this.service.getHotels()
    .subscribe({
        next: (hotels: any)=>{
            this.hotels= hotels?.hotels
            this.filteredHotels = [...this.hotels]; 

            this.cdr.detectChanges();
        }
    })
  }

  public getGuestUserHotels(): void {
    this.service.getAssignedHotels(this.userId).subscribe({
      next: (response: any) => {
        
        const assignedHotels = response?.hotels?.[0]?.hotels || [];
        
        this.guestUserAccountId= response?.hotels?.[0]?.id
        
        this.existingHotelIds = assignedHotels.map((hotel: any) => hotel.id);
        this.selectedHotelIds = [...this.existingHotelIds]; 
        this.cdr.detectChanges();
        
      },
      error: (err) => {
        console.error('Error fetching assigned hotels:', err);
      }
    });
  }


  onSelectHotel(id: number): void {
    if (!this.selectedHotelIds.includes(id)) {
      this.selectedHotelIds.push(id); 
      
    } else {
      this.selectedHotelIds = this.selectedHotelIds.filter((hotelId) => hotelId !== id); 

      
    }
    this.selectAll = this.selectedHotelIds.length === this.filteredHotels.length;

  }

  public onAddHotel(): void {
    if (this.selectedHotelIds.length === 0) {
      this.translate.get('TR.hotel_assign_warining').subscribe((message: string) => {
        this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
          this.toastr.warning(message, title);
        });
      });
      return;
    }

    const payload = {
      user: this.userId,
      hotels: this.selectedHotelIds
    };

    if (this.arraysEqual(this.selectedHotelIds, this.existingHotelIds)) {
      this.translate.get('TR.no_changes').subscribe((message: string) => {
        this.toastr.info(message);
      });
    } else if (this.existingHotelIds.length > 0) {
    
      this.service.updateAssignedHotels(this.guestUserAccountId, payload).subscribe({
        next: (response: any) => {
          this.translate.get('TR.hotel_assign_success').subscribe((message: string) => {
            this.toastr.success(message);
          });
        },
        error: (err) => {
          console.error('Error updating assigned hotels:', err);
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.toastr.error(message);
          });
        }
      });
    } else {
      this.service.assignHotel(payload).subscribe({
        next: (response: any) => {
          this.translate.get('TR.hotel_assign_success').subscribe((message: string) => {
            this.toastr.success(message);
          });
        },
        error: (err) => {
          console.error('Error assigning hotels:', err);
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.toastr.error(message);
          });
        }
      });
    }
  }

  private arraysEqual(arr1: number[], arr2: number[]): boolean {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
  }

  onSearch(event: KeyboardEvent): void {
    const searchTerm = this.searchValue.toLowerCase(); 
    this.filteredHotels = this.hotels.filter(hotel => 
      hotel.title.toLowerCase().includes(searchTerm) || 
      hotel.address.toLowerCase().includes(searchTerm) || 
      hotel.city?.title.toLowerCase().includes(searchTerm) || 
      hotel.district.toLowerCase().includes(searchTerm)
    );
    this.selectAll = this.selectedHotelIds.length === this.filteredHotels.length;

  }


}

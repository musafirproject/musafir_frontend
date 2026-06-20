import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { AppConfig } from '@app/shared/types/app-config.interface';
import { Observable, forkJoin } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { supportedLanguages } from '@app/configs/i18n.config';
import { UpdateCurrentLanguage } from '@app/store/app-config/app-config.action';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.header-nav-item]': 'true'
  }
})
export class LoginComponent implements OnInit {
  @Select((state: { app: AppConfig }) => state.app) app$: Observable<AppConfig>;

  currentLang: string;
  languageList = [];
  loginForm: FormGroup;
  isSubmitting = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.getLanguageList();

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.app$.subscribe(app => {
      this.currentLang = app.lang;
    });
  }

  getLanguageList() {
    const list = [];
    for (const key in supportedLanguages) {
      if (Object.prototype.hasOwnProperty.call(supportedLanguages, key)) {
        const lang = supportedLanguages[key];
        list.push({
          key,
          lang
        });
      }
    }
    this.languageList = list;
  }

  setLanguage(language: string) {
    this.store.dispatch(new UpdateCurrentLanguage(language));
    this.translateService.use(language);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    const { email, password } = this.loginForm.value;

    forkJoin({
      loginRes: this.authService.Login(email, password),
      tokenRes: this.authService.getToken(email, password)
    }).subscribe({
      next: ({ loginRes, tokenRes }: any) => {
        if (tokenRes?.access) {
          this.authService.storeToStorage('access_token', tokenRes.access);
        }

        if (tokenRes?.refresh) {
          this.authService.storeToStorage('refresh_token', tokenRes.refresh);
        }

        if (loginRes?.user) {
          this.authService.storeToStorage('user', loginRes.user);
        }

        this.authService.setLoginState(true);

        const role = loginRes?.user?.role?.code;
        this.redirectAfterLogin(role);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.loginError = error?.error?.message || 'Login failed';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private redirectAfterLogin(role: string) {
    switch (role) {
      case 'super_admin':
      case 'sub_admin':
      case 'guest_user':
        this.router.navigate(['/dashboard']);
        break;

      case 'guest_care':
        this.router.navigate(['/guests/list']);
        break;

      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}

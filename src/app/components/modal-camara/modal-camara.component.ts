import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-modal-camara',
  templateUrl: './modal-camara.component.html',
  styleUrls: ['./modal-camara.component.scss'],
})

export class ModalCamaraComponent implements AfterViewInit, OnDestroy {
  imageUrl: string | undefined;
  videoUrl: string | undefined;
  isDesktop: boolean;
  isRecording: boolean = false;
  videoStreamActive = false;
  cameraPermissionDenied = false; // Nuevo estado para los permisoss
  private videoStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;

  constructor(private modalController: ModalController, private http: HttpClient) {
    this.isDesktop = !this.isMobile();
  }

  ngAfterViewInit() {
    if (this.isDesktop) {
      this.takePhotoWithWebCamera();
    }
  }

  ngOnDestroy() {
    this.stopVideoStream();
  }

  isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    if (this.isDesktop) {
      await this.recordVideoWithWebCamera();
    } else {
      await this.recordVideoWithCapacitorCamera();
    }
  }

  async recordVideoWithCapacitorCamera() {
    try {
      // Solicitar permisos de cámara y micrófono con getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Crear un MediaRecorder para grabar el video
      const mediaRecorder = new MediaRecorder(stream);
      const recordedChunks: Blob[] = [];
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        this.videoUrl = URL.createObjectURL(videoBlob);
        this.stopVideoStream();
      };
  
      mediaRecorder.start();
      this.isRecording = true;
  
      setTimeout(() => {
        mediaRecorder.stop();
        this.isRecording = false;
      }, 10000);
  
    } catch (error) {
      this.cameraPermissionDenied = true;
      console.error('Error al acceder a la cámara o micrófono:', error);
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  async recordVideoWithWebCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.videoStreamActive = true;
      this.cameraPermissionDenied = false;
      this.video.nativeElement.srcObject = this.videoStream;

      this.mediaRecorder = new MediaRecorder(this.videoStream);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const videoBlob = new Blob(this.recordedChunks, { type: 'video/mp4' });
        this.videoUrl = URL.createObjectURL(videoBlob);
        this.stopVideoStream();
        this.saveVideoToDatabase(this.videoUrl);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      this.cameraPermissionDenied = true;
      console.error('Error al acceder a la cámara:', error);
    }
  }

  async takePhoto() {
    if (this.isDesktop) {
      await this.takePhotoWithWebCamera();
    } else {
      await this.takePhotoWithCapacitorCamera();
    }

    if (this.imageUrl) {
      this.savePhotoToDatabase(this.imageUrl);
    }
  }

  async takePhotoWithWebCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoStreamActive = true;
      this.cameraPermissionDenied = false;
      this.video.nativeElement.srcObject = this.videoStream;

      setTimeout(() => this.captureImageFromVideo(), 1000);
    } catch (error) {
      this.cameraPermissionDenied = true;
      console.error('Error accediendo a la cámara:', error);
    }
  }

  captureImageFromVideo() {
    const canvas = document.createElement('canvas');
    const video = this.video.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageUrl = canvas.toDataURL('image/png');
      this.stopVideoStream();
    }
  }

  async takePhotoWithCapacitorCamera() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    this.imageUrl = image.dataUrl;
  }

  stopVideoStream() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
      this.videoStreamActive = false;
    }
  }

  savePhotoToDatabase(image: string) {
    this.http.post('https://api-dpdi.vercel.app/api/photo/photos', { photo: image }).subscribe(
      (response) => console.log('Foto guardada con éxito:', response),
      (error) => console.error('Error al guardar la foto:', error)
    );
  }

  saveVideoToDatabase(video: string) {
    this.http.post('https://api-dpdi.vercel.app/api/video/videos', { video }).subscribe(
      (response) => console.log('Video guardado con éxito:', response),
      (error) => console.error('Error al guardar el video:', error)
    );
  }

  dismissModal() {
    this.stopVideoStream();
    this.modalController.dismiss();
  }
}
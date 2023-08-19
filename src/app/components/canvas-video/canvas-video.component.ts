import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import * as tf from '@tensorflow/tfjs';
import { LoadingController } from '@ionic/angular';
import { Boxes, ObjectDetectionFromYoloToTensorflowService } from 'object-detection-from-yolo-to-tensorflow';
@Component({
  selector: 'app-canvas-video',
  templateUrl: './canvas-video.component.html',
  styleUrls: ['./canvas-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVideoComponent implements OnInit, OnDestroy {

  /**
   * destroy
   */
  private readonly _destroy$ = new Subject();

  /**
   * video
   */
  @ViewChild('video') private video: ElementRef<HTMLVideoElement> | null = null


  /**
   * predictionReturn
   */
  @Output() predictionReturn = new EventEmitter<{ canvas: HTMLCanvasElement, boxes: Boxes[] | null, videoTime?: number }>();


  /**
  *  Auto play
  */
  @Input()
  public set autoplay(v: boolean) {
    this._autoplay = v;
  }
  private _autoplay: boolean = false;
  public get autoplay(): boolean {
    return this._autoplay;
  }

  /**
   * Canvas where the video will be set
   */
  @Input()
  public set canvas(v: HTMLCanvasElement | null) {
    this._canvas = v;
  }
  private _canvas: HTMLCanvasElement | null = null;
  public get canvas(): HTMLCanvasElement | null {
    return this._canvas;
  }

  /**
   * Interetion Per Seconde
   * 200 is default
   */
  @Input()
  public set interetionPerSec(v: number) {
    this._interetionPerSec = v;
  }
  private _interetionPerSec: number = 200;
  public get interetionPerSec(): number {
    return this._interetionPerSec;
  }

  /**
   * video Url
   */
  @Input()
  public set videoUrl(v: string | null) {
    this._videoUrl = v;
  }
  private _videoUrl: string | null = null;
  public get videoUrl(): string | null {
    return this._videoUrl;
  }


  /**
   * Variable set Interval Reference
   */
  private _setIntervalReference: any | null = null;
  private get setIntervalReference(): any | null {
    return this._setIntervalReference;
  }
  private set setIntervalReference(v: any | null) {
    this._setIntervalReference = v;
  }

  /*
   * Stream
   */
  private readonly _stream = new BehaviorSubject<MediaStream | null>(null);

  /*
  * Stream getter
  */
  private get stream(): MediaStream | null {
    return this._stream.getValue();
  }

  /*
   * Stream setter
   */
  private set stream(value: MediaStream | null) {
    if (this._stream.getValue() !== value) {
      this._stream.next(value);
    }
  }


  /**
   * activate frame says to camera when is the last frame
   */
  private _activateFrame: boolean = false;
  private get activateFrame(): boolean {
    return this._activateFrame;
  }
  private set activateFrame(v: boolean) {
    this._activateFrame = v;
  }


  /*
   * Model
   */
  private _model: tf.GraphModel<string | tf.io.IOHandler> | null = null;

  /*
  * Model getter
  */
  public get model(): tf.GraphModel<string | tf.io.IOHandler> | null {
    return this._model;
  }

  /*
   * Model setter
   */
  @Input()
  public set model(value: tf.GraphModel<string | tf.io.IOHandler> | null) {
    if (this._model !== value) {
      this._model = value;
    }
  }

  /**
   *
   * @param objectDetect
   * @param loadingCtrl
   */
  constructor(private objectDetect: ObjectDetectionFromYoloToTensorflowService, private loadingCtrl: LoadingController) { }

  /**
   * ng On Init
   */
  ngOnInit(): void {
    this._stream.pipe(
      tap((stream: MediaStream | null) => {
        if (stream) {
          this.setVideoOnCanvas(stream);
        }
      }),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe();
    if (this.autoplay) {
      this.startCamera();
    }
  }

  /**
   * ng On Destroy
   */
  ngOnDestroy(): void {
    this.stopCamera();
  }

  /**
   * Set video on canvas
   * @param stream
   */
  private setVideoOnCanvas(stream: MediaStream) {
    const canvas = this.canvas;
    const video = this.video?.nativeElement
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (canvas && video && ctx) {
      if (this.videoUrl) {
        video.muted = true;
        video.src = this.videoUrl;
      } else {
        video.srcObject = stream;
      }

      // video.src = "assets/videos/walter-white-flipping-off-security-camera.mp4";
      video.play();

      // Wait for the video stream to initialize
      video.addEventListener('loadedmetadata', () => {

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const videoFrame = () => {
          if (this.model) {
            this.objectDetect.predict(this.model, video, 0.7, 224, 224).then(boxes => {
              ctx?.drawImage(video, 0, 0);
              this.predictionReturn.emit({ boxes, canvas, videoTime: video.currentTime });
            })
          }

        }
        this.setIntervalReference = setInterval(() => {
          if (this.activateFrame) {
            videoFrame()
          }
        }, this.interetionPerSec);
      });

    }
  }

  /**
   * Start camera
   */
  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
      this.activateFrame = true;
      this._stream.next(stream);
    });
  }

  /**
   * Stop the webcam
   */
  stopCamera() {
    if (this.stream && this.setIntervalReference) {
      this.activateFrame = false;
      clearInterval(this.setIntervalReference)
      const tracks = this.stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };
}

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Boxes, ObjectDetectionFromYoloToTensorflowService } from 'object-detection-from-yolo-to-tensorflow';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-mask-detect',
  templateUrl: './mask-detect.component.html',
  styleUrls: ['./mask-detect.component.css']
})
export class MaskDetectComponent implements OnInit, OnDestroy {


  /**
 * Create a HTML Canvas reference
 */
  @ViewChild('canvasDisplay', { static: true }) canvasDisplay: ElementRef<HTMLCanvasElement> | null = null

  /**
   * Object reference to the tensorflow model
   */
  model: tf.GraphModel<string | tf.io.IOHandler> | null = null;

  /**
   * Prediction
   */
  msg = ''

  /**
   *
   */
  constructor(private objectDetect: ObjectDetectionFromYoloToTensorflowService) {

    const dbName = 'mask_detector'
    tf.loadGraphModel(`assets/${dbName}/model.json`,).then(async (model: tf.GraphModel<string | tf.io.IOHandler>) => {
      this.model = model;
    });
  }

  /**
   *
   */
  ngOnDestroy(): void {
    this.model?.dispose();
    this.model?.disposeIntermediateTensors();
    tf.disposeVariables();
  }

  /**
   *
   */
  ngOnInit(): void {
  }

  /**
 *
 * @param predition
 */
  predictionReturn(predition: { canvas: HTMLCanvasElement, boxes: Boxes[] | null }) {
    if (predition.boxes && predition.canvas) {
      const ctx = predition.canvas.getContext('2d');
      if (predition.boxes && ctx) {
        const classes = ['Without Mask', 'With Mask', 'Mask Weared Incorrect']
        predition.boxes.slice(0, 1).forEach(bbox => {
          const box = new Array<Boxes>();
          box.push(bbox)
          let boxColor = '';
          switch (bbox.classeId) {
            case 0: boxColor = 'red'; break;
            case 1: boxColor = 'green'; break;
            case 2: boxColor = 'blue'; break;
          }
          const score = bbox.score.toFixed(2)
          this.msg = `${classes[bbox.classeId]} - ${score}%`
          this.objectDetect.createBoundingBox(box, true, classes, false, predition.canvas, boxColor, 2, true)
        });

      }
    }

  }
}
